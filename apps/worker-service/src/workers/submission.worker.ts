import { Worker, Job } from 'bullmq';
import { DEFAULT_LIMITS, REDIS_CHANNELS } from '@ocj/constants';
import { executeTestCase, getLanguageId, LanguageKey } from '@ocj/executor';
import { prisma } from '../config/prisma';
import { redisOptions, redis } from '../config/redis';

const getJudge0Url = () => process.env.JUDGE0_URL || 'http://localhost:2358';

export const startSubmissionWorker = () => {
  const worker = new Worker(
    'submission_queue',
    async (job: Job) => {
      const { submissionId, code, language, problemId } = job.data;
      console.log(`Processing Job ${job.id} for Submission ${submissionId}`);

      try {
        const submission = await prisma.submission.findUnique({
          where: { id: submissionId },
        });
        if (!submission) {
          console.error(`Submission ${submissionId} not found in database`);
          return;
        }

        await prisma.submission.update({
          where: { id: submissionId },
          data: { status: 'PROCESSING' },
        });

        const problem = await prisma.problem.findUnique({
          where: { id: problemId },
        });
        if (!problem) {
          await prisma.submission.update({
            where: { id: submissionId },
            data: {
              status: 'CE',
              error_message: 'Problem context not found',
            },
          });
          return;
        }

        const testCases = await prisma.testcase.findMany({
          where: { problem_id: problemId },
          orderBy: { id: 'asc' },
        });
        if (testCases.length === 0) {
          await prisma.submission.update({
            where: { id: submissionId },
            data: {
              status: 'CE',
              error_message: 'No testcases found for this problem',
            },
          });
          return;
        }

        let passedCount = 0;
        let totalTime = 0;
        let maxMemory = 0;
        let finalStatus: 'ACCEPTED' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' = 'ACCEPTED';
        let errorMsg = '';

        const languageId = getLanguageId(language as LanguageKey);

        for (let i = 0; i < testCases.length; i++) {
          const tc = testCases[i];
          const result = await executeTestCase(
            code,
            languageId,
            tc.input,
            tc.output,
            problem.time_limit || DEFAULT_LIMITS.TIME_LIMIT_MS,
            {
              judge0Url: getJudge0Url(),
            }
          );

          if (result.status === 'ACCEPTED') {
            passedCount++;
          } else {
            finalStatus = result.status as typeof finalStatus;
            errorMsg = result.error || `Failed on testcase ${i + 1}`;
            break;
          }

          totalTime += result.time;
          maxMemory = Math.max(maxMemory, result.memory);
        }

        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: finalStatus,
            test_cases_passed: passedCount,
            test_cases_total: testCases.length,
            execution_time: totalTime,
            memory_used: maxMemory,
            error_message: errorMsg || null,
          },
        });
        console.log(`Submission ${submissionId} evaluated: ${finalStatus} (${passedCount}/${testCases.length})`);

        await redis.publish(
          REDIS_CHANNELS.SUBMISSION_UPDATES,
          JSON.stringify({
            submissionId,
            userId: submission.user_id,
            problemId,
            status: finalStatus,
            testCasesPassed: passedCount,
            testCasesTotal: testCases.length,
            matchId: submission.match_id ?? undefined,
          })
        );
      } catch (err: any) {
        console.error(`Error processing job ${job.id}:`, err);
        throw err;
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

  worker.on('error', (err) => {
    console.error('Submission worker error:', err);
  });

  console.log('Submission Queue Worker started successfully');
  return worker;
};
