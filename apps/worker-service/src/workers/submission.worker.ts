import { Worker, Job } from 'bullmq';
import { redisOptions, redis } from '../config/redis';
import { Submission } from '../models/submission.model';
import { Problem } from '../models/problem.model';
import { Testcase } from '../models/testcase.model';
import { executeTestCase, getLanguageId, LanguageKey } from '@ocj/executor';

const getRapidApiKey = () => process.env.RAPIDAPI_KEY || '';
const getRapidApiHost = () => process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
const getJudge0Url = () => process.env.JUDGE0_URL || `https://${getRapidApiHost()}`;

export const startSubmissionWorker = () => {
  const worker = new Worker(
    'submission_queue',
    async (job: Job) => {
      const { submissionId, code, language, problemId } = job.data;
      console.log(`Processing Job ${job.id} for Submission ${submissionId}`);

      try {
        // 1. Update status to PROCESSING
        const submission = await Submission.findById(submissionId);
        if (!submission) {
          console.error(`Submission ${submissionId} not found in database`);
          return;
        }

        submission.status = 'PROCESSING';
        await submission.save();

        // 2. Fetch problem limits
        const problem = await Problem.findById(problemId);
        if (!problem) {
          submission.status = 'CE';
          submission.errorMessage = 'Problem context not found';
          await submission.save();
          return;
        }

        // 3. Fetch testcases
        const testCases = await Testcase.find({ problemId });
        if (testCases.length === 0) {
          submission.status = 'CE';
          submission.errorMessage = 'No testcases found for this problem';
          await submission.save();
          return;
        }

        let passedCount = 0;
        let totalTime = 0;
        let maxMemory = 0;
        let finalStatus: 'ACCEPTED' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' = 'ACCEPTED';
        let errorMsg = '';

        const languageId = getLanguageId(language as LanguageKey);

        // Run each testcase sequentially
        for (let i = 0; i < testCases.length; i++) {
          const tc = testCases[i];
          const result = await executeTestCase(
            code,
            languageId,
            tc.input,
            tc.output,
            problem.timeLimit || 2000,
            {
              judge0Url: getJudge0Url(),
              rapidApiKey: getRapidApiKey(),
              rapidApiHost: getRapidApiHost(),
            }
          );

          if (result.status === 'ACCEPTED') {
            passedCount++;
          } else {
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
        if (errorMsg) submission.errorMessage = errorMsg;

        await submission.save();
        console.log(`Submission ${submissionId} evaluated: ${finalStatus} (${passedCount}/${testCases.length})`);

        // 5. Publish update to Redis channel for Realtime Solo 1vs1 match updates
        await redis.publish(
          'submission-updates',
          JSON.stringify({
            submissionId,
            userId: submission.userId,
            problemId,
            status: finalStatus,
            testCasesPassed: passedCount,
            testCasesTotal: testCases.length,
          })
        );
      } catch (err: any) {
        console.error(`Error processing job ${job.id}:`, err);
        // Put submission into runtime error state
        try {
          await Submission.findByIdAndUpdate(submissionId, {
            status: 'RE',
            errorMessage: err.message || 'Unknown runner error',
          });
        } catch (dbErr) {
          console.error('Failed to update submission on failure state:', dbErr);
        }
      }
    },
    {
      connection: redisOptions,
      concurrency: 2,
    }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });

  console.log('Submission Queue Worker started successfully');
};
