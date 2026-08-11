import { Worker, Job } from 'bullmq';
import { DEFAULT_LIMITS } from '@ocj/constants';
import { executeTestCase, getLanguageId, LanguageKey } from '@ocj/executor';
import { redisOptions } from '../config/redis';
import { submissionPublisher } from '../publishers/submission.publisher';
import { problemRepository } from '../repositories/problem.repository';
import { submissionRepository } from '../repositories/submission.repository';
import { testcaseRepository } from '../repositories/testcase.repository';

const getJudge0Url = () => process.env.JUDGE0_URL || 'http://localhost:2358';

export const startSubmissionWorker = () => {
  const worker = new Worker(
    'submission_queue',
    async (job: Job) => {
      const { submissionId, code, language, problemId } = job.data;
      console.log(`Processing Job ${job.id} for Submission ${submissionId}`);

      try {
        const submission = await submissionRepository.findById(submissionId);
        if (!submission) {
          console.error(`Submission ${submissionId} not found in database`);
          return;
        }

        await submissionRepository.markProcessing(submissionId);

        const problem = await problemRepository.findById(problemId);
        if (!problem) {
          await submissionRepository.markFailed(submissionId, 'Problem context not found');
          return;
        }

        const testCases = await testcaseRepository.findByProblemId(problemId);
        if (testCases.length === 0) {
          await submissionRepository.markFailed(submissionId, 'No testcases found for this problem');
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

        await submissionRepository.finalize(submissionId, {
          status: finalStatus,
          testCasesPassed: passedCount,
          testCasesTotal: testCases.length,
          executionTime: totalTime,
          memoryUsed: maxMemory,
          errorMessage: errorMsg || null,
        });
        console.log(`Submission ${submissionId} evaluated: ${finalStatus} (${passedCount}/${testCases.length})`);

        await submissionPublisher.publishFinalResult({
          submissionId,
          userId: submission.user_id,
          problemId,
          status: finalStatus,
          testCasesPassed: passedCount,
          testCasesTotal: testCases.length,
          matchId: submission.match_id ?? undefined,
        });
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
