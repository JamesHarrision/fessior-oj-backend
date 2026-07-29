"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSubmissionWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const submission_model_1 = require("../models/submission.model");
const problem_model_1 = require("../models/problem.model");
const testcase_model_1 = require("../models/testcase.model");
const executor_1 = require("@ocj/executor");
const constants_1 = require("@ocj/constants");
const getRapidApiKey = () => process.env.RAPIDAPI_KEY || '';
const getRapidApiHost = () => process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
const getJudge0Url = () => process.env.JUDGE0_URL || `https://${getRapidApiHost()}`;
const isLocalFallbackEnabled = () => process.env.ENABLE_LOCAL_FALLBACK === 'true';
const startSubmissionWorker = () => {
    const worker = new bullmq_1.Worker('submission_queue', async (job) => {
        const { submissionId, code, language, problemId } = job.data;
        console.log(`Processing Job ${job.id} for Submission ${submissionId}`);
        try {
            // 1. Update status to PROCESSING
            const submission = await submission_model_1.Submission.findById(submissionId);
            if (!submission) {
                console.error(`Submission ${submissionId} not found in database`);
                return;
            }
            submission.status = 'PROCESSING';
            await submission.save();
            // 2. Fetch problem limits
            const problem = await problem_model_1.Problem.findById(problemId);
            if (!problem) {
                submission.status = 'CE';
                submission.errorMessage = 'Problem context not found';
                await submission.save();
                return;
            }
            // 3. Fetch testcases
            const testCases = await testcase_model_1.Testcase.find({ problemId });
            if (testCases.length === 0) {
                submission.status = 'CE';
                submission.errorMessage = 'No testcases found for this problem';
                await submission.save();
                return;
            }
            let passedCount = 0;
            let totalTime = 0;
            let maxMemory = 0;
            let finalStatus = 'ACCEPTED';
            let errorMsg = '';
            const languageId = (0, executor_1.getLanguageId)(language);
            // Run each testcase sequentially
            for (let i = 0; i < testCases.length; i++) {
                const tc = testCases[i];
                const result = await (0, executor_1.executeTestCase)(code, languageId, tc.input, tc.output, problem.timeLimit || constants_1.DEFAULT_LIMITS.TIME_LIMIT_MS, {
                    judge0Url: getJudge0Url(),
                    rapidApiKey: getRapidApiKey(),
                    rapidApiHost: getRapidApiHost(),
                    enableLocalFallback: isLocalFallbackEnabled(),
                });
                if (result.status === 'ACCEPTED') {
                    passedCount++;
                }
                else {
                    finalStatus = result.status;
                    errorMsg = result.error || `Failed on testcase ${i + 1}`;
                    break; // Stop executing on first failed testcase
                }
                totalTime += result.time;
                maxMemory = Math.max(maxMemory, result.memory);
            }
            // 4. Update Submission with results
            submission.status = finalStatus;
            submission.testCasesPassed = passedCount;
            submission.testCasesTotal = testCases.length;
            submission.executionTime = totalTime;
            submission.memoryUsed = maxMemory;
            if (errorMsg)
                submission.errorMessage = errorMsg;
            await submission.save();
            console.log(`Submission ${submissionId} evaluated: ${finalStatus} (${passedCount}/${testCases.length})`);
            // 5. Publish update to Redis channel for Realtime Solo 1vs1 match updates
            await redis_1.redis.publish(constants_1.REDIS_CHANNELS.SUBMISSION_UPDATES, JSON.stringify({
                submissionId,
                userId: submission.userId,
                problemId,
                status: finalStatus,
                testCasesPassed: passedCount,
                testCasesTotal: testCases.length,
                matchId: submission.matchId ?? undefined,
            }));
        }
        catch (err) {
            console.error(`Error processing job ${job.id}:`, err);
            // Put submission into runtime error state
            try {
                await submission_model_1.Submission.findByIdAndUpdate(submissionId, {
                    status: 'RE',
                    errorMessage: err.message || 'Unknown runner error',
                });
            }
            catch (dbErr) {
                console.error('Failed to update submission on failure state:', dbErr);
            }
        }
    }, {
        connection: redis_1.redisOptions,
        concurrency: 2,
    });
    worker.on('completed', (job) => {
        console.log(`Job ${job.id} completed successfully`);
    });
    worker.on('failed', (job, err) => {
        console.error(`Job ${job?.id} failed:`, err);
    });
    console.log('Submission Queue Worker started successfully');
};
exports.startSubmissionWorker = startSubmissionWorker;
