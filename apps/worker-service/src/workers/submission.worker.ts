import { Worker, Job } from 'bullmq';
import { LanguageKey } from '@ocj/executor';
import { redisOptions } from '../config/redis';
import { submissionPublisher } from '../publishers/submission.publisher';
import { problemRepository } from '../repositories/problem.repository';
import { submissionRepository } from '../repositories/submission.repository';
import { testcaseRepository } from '../repositories/testcase.repository';
import { submissionJudgeService } from '../services/submission-judge.service';

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

        const judgeResult = await submissionJudgeService.judge({
          code,
          language: language as LanguageKey,
          problem,
          testCases,
          judge0Url: getJudge0Url(),
        });

        await submissionRepository.finalize(submissionId, {
          status: judgeResult.status,
          testCasesPassed: judgeResult.passedCount,
          testCasesTotal: judgeResult.totalCount,
          executionTime: judgeResult.executionTime,
          memoryUsed: judgeResult.memoryUsed,
          errorMessage: judgeResult.errorMessage,
        });
        console.log(
          `Submission ${submissionId} evaluated: ${judgeResult.status} (${judgeResult.passedCount}/${judgeResult.totalCount})`
        );

        await submissionPublisher.publishFinalResult({
          submissionId,
          userId: submission.user_id,
          problemId,
          status: judgeResult.status,
          testCasesPassed: judgeResult.passedCount,
          testCasesTotal: judgeResult.totalCount,
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
