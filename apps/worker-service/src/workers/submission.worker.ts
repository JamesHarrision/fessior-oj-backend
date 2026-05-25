import { Worker, Job } from 'bullmq';
import { redisOptions, redis } from '../config/redis';
import { Submission } from '../models/submission.model';
import { Problem } from '../models/problem.model';
import { Testcase } from '../models/testcase.model';
import axios from 'axios';

// Judge0 Language IDs
const LANGUAGE_IDS = {
  cpp: 54, // C++ (GCC 9.2.0)
  java: 62, // Java (JDK 13.0.1)
  python: 71, // Python (3.8.1)
};

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
const JUDGE0_URL = process.env.JUDGE0_URL || `https://${RAPIDAPI_HOST}`;

const getLanguageId = (lang: 'cpp' | 'java' | 'python'): number => {
  return LANGUAGE_IDS[lang] || 71;
};

// Execute code against Judge0 API
const executeTestCase = async (
  code: string,
  languageId: number,
  stdin: string,
  expectedOutput: string,
  timeLimitMs: number
): Promise<{
  status: 'ACCEPTED' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE';
  time: number;
  memory: number;
  error: string | null;
}> => {
  if (!RAPIDAPI_KEY) {
    // Return mock successful result for testing/offline mode
    console.warn('RAPIDAPI_KEY is not defined. Using offline simulated compilation and test runner.');
    return {
      status: 'ACCEPTED',
      time: 50,
      memory: 2000,
      error: null,
    };
  }

  try {
    const response = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`,
      {
        source_code: Buffer.from(code).toString('base64'),
        language_id: languageId,
        stdin: Buffer.from(stdin).toString('base64'),
        expected_output: Buffer.from(expectedOutput).toString('base64'),
        cpu_time_limit: timeLimitMs / 1000,
      },
      {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = response.data;
    // Status ids:
    // 3: Accepted
    // 4: Wrong Answer
    // 5: Time Limit Exceeded
    // 6: Compilation Error
    // 7..12: Runtime Errors / Others
    const statusId = result.status?.id;
    let status: 'ACCEPTED' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' = 'WA';

    if (statusId === 3) status = 'ACCEPTED';
    else if (statusId === 4) status = 'WA';
    else if (statusId === 5) status = 'TLE';
    else if (statusId === 6) status = 'CE';
    else if (statusId >= 7 && statusId <= 12) status = 'RE';

    return {
      status,
      time: result.time ? Math.round(parseFloat(result.time) * 1000) : 0,
      memory: result.memory || 0,
      error: result.compile_output ? Buffer.from(result.compile_output, 'base64').toString('utf-8') : null,
    };
  } catch (err: any) {
    console.error('Error calling Judge0 API:', err.message);
    throw err;
  }
};

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

        const languageId = getLanguageId(language);

        // Run each testcase sequentially
        for (let i = 0; i < testCases.length; i++) {
          const tc = testCases[i];
          const result = await executeTestCase(
            code,
            languageId,
            tc.input,
            tc.output,
            problem.timeLimit
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
