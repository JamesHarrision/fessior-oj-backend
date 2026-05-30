import { Problem } from '../models/problem.model';
import { Submission } from '../models/submission.model';
import { Testcase } from '../models/testcase.model';
import { submissionQueue } from '../config/queue';
import { AppError } from '@ocj/errors';
import mongoose from 'mongoose';
import axios from 'axios';

const LANGUAGE_IDS = {
  cpp: 54,
  java: 62,
  python: 71,
};

export class SubmissionService {
  async submit(
    userId: string,
    data: {
      problemId: string;
      code: string;
      language: 'cpp' | 'java' | 'python';
    }
  ) {
    // 1. Find problem by Mongo ObjectId or slug
    let problem = null;
    if (mongoose.Types.ObjectId.isValid(data.problemId)) {
      problem = await Problem.findById(data.problemId);
    }
    if (!problem) {
      problem = await Problem.findOne({ slug: data.problemId });
    }

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    // 2. Create submission in MongoDB
    const submission = new Submission({
      userId,
      problemId: problem._id,
      code: data.code,
      language: data.language,
      status: 'PENDING',
      testCasesPassed: 0,
      testCasesTotal: 0,
    });
    await submission.save();

    // 3. Add to BullMQ Queue
    await submissionQueue.add('submission-job', {
      submissionId: submission._id.toString(),
      code: submission.code,
      language: submission.language,
      problemId: problem._id.toString(),
    });

    return submission;
  }

  async getSubmissionDetails(submissionId: string, userId: string, isAdmin = false) {
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      throw new AppError('Invalid submission ID format', 400);
    }

    const submission = await Submission.findById(submissionId).populate('problemId', 'title slug');
    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    // Security check: Only the author or an Admin can view details of a submission
    if (submission.userId !== userId && !isAdmin) {
      throw new AppError('Forbidden: Access denied to this submission', 403);
    }

    return submission;
  }

  async getUserSubmissions(
    userId: string,
    filters: {
      problemId?: string;
      page: number;
      limit: number;
    }
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = { userId };
    if (filters.problemId && mongoose.Types.ObjectId.isValid(filters.problemId)) {
      query.problemId = new mongoose.Types.ObjectId(filters.problemId);
    }

    const [total, items] = await Promise.all([
      Submission.countDocuments(query),
      Submission.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('problemId', 'title slug difficulty'),
    ]);

    return {
      total,
      page,
      limit,
      items,
    };
  }

  async runCode(data: {
    problemId: string;
    code: string;
    language: 'cpp' | 'java' | 'python';
    customInput?: string;
  }) {
    let problem = null;
    if (mongoose.Types.ObjectId.isValid(data.problemId)) {
      problem = await Problem.findById(data.problemId);
    }
    if (!problem) {
      problem = await Problem.findOne({ slug: data.problemId });
    }
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    let testcasesToRun: Array<{ input: string; output: string; isExample: boolean }> = [];
    if (data.customInput !== undefined && data.customInput !== null) {
      testcasesToRun = [{ input: data.customInput, output: '', isExample: false }];
    } else {
      testcasesToRun = await Testcase.find({ problemId: problem._id, isExample: true });
      if (testcasesToRun.length === 0) {
        testcasesToRun = [{ input: '', output: '', isExample: true }];
      }
    }

    const rapidApiKey = process.env.RAPIDAPI_KEY || '';
    const rapidApiHost = process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
    const judge0Url = process.env.JUDGE0_URL || `https://${rapidApiHost}`;
    const isRapidAPI = judge0Url.includes('rapidapi.com');
    const languageId = LANGUAGE_IDS[data.language] || 71;

    const results = [];
    for (const tc of testcasesToRun) {
      if (isRapidAPI && !rapidApiKey) {
        // Fallback or mock successful result for testing/offline mode
        results.push({
          status: 'ACCEPTED',
          input: tc.input,
          expectedOutput: tc.output,
          actualOutput: 'Simulated Output (Offline Mode)\n',
          time: 30,
          memory: 1200,
          error: null,
        });
      } else {
        try {
          const headers: any = { 'Content-Type': 'application/json' };
          if (isRapidAPI) {
            headers['x-rapidapi-key'] = rapidApiKey;
            headers['x-rapidapi-host'] = rapidApiHost;
          }

          const response = await axios.post(
            `${judge0Url}/submissions?base64_encoded=true&wait=true`,
            {
              source_code: Buffer.from(data.code).toString('base64'),
              language_id: languageId,
              stdin: Buffer.from(tc.input).toString('base64'),
              expected_output: Buffer.from(tc.output).toString('base64'),
              cpu_time_limit: (problem.timeLimit || 2000) / 1000,
            },
            { headers }
          );

          const result = response.data;
          const statusId = result.status?.id;
          let status: 'ACCEPTED' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' = 'WA';
          if (statusId === 3) status = 'ACCEPTED';
          else if (statusId === 4) status = 'WA';
          else if (statusId === 5) status = 'TLE';
          else if (statusId === 6) status = 'CE';
          else if (statusId >= 7 && statusId <= 12) status = 'RE';

          const actualOutput = result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf-8') : '';
          const compileOutput = result.compile_output ? Buffer.from(result.compile_output, 'base64').toString('utf-8') : '';
          const stderrOutput = result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf-8') : '';

          results.push({
            status,
            input: tc.input,
            expectedOutput: tc.output,
            actualOutput,
            time: result.time ? Math.round(parseFloat(result.time) * 1000) : 0,
            memory: result.memory || 0,
            error: compileOutput || stderrOutput || null,
          });
        } catch (err: any) {
          results.push({
            status: 'RE' as const,
            input: tc.input,
            expectedOutput: tc.output,
            actualOutput: '',
            time: 0,
            memory: 0,
            error: err.message,
          });
        }
      }
    }

    return results;
  }
}

export const submissionService = new SubmissionService();
