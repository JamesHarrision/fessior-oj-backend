import { Problem } from '../models/problem.model';
import { Submission } from '../models/submission.model';
import { Testcase } from '../models/testcase.model';
import { submissionQueue } from '../config/queue';
import { AppError } from '@ocj/errors';
import mongoose from 'mongoose';
import { executeTestCase, LANGUAGE_IDS, LanguageKey } from '@ocj/executor';
import { DEFAULT_LIMITS } from '@ocj/constants';

export class SubmissionService {
  async submit(
    userId: string,
    data: {
      problemId: string;
      code: string;
      language: 'cpp' | 'java' | 'python';
      matchId?: string;
      contestId?: string;
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
      matchId: data.matchId ?? null,
      contestId: data.contestId ?? null,
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

    const submission = await Submission.findById(submissionId).populate('problemId', 'title slug difficulty');
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
    const languageId = LANGUAGE_IDS[data.language as LanguageKey] || 71;

    const results = [];
    for (const tc of testcasesToRun) {
      const result = await executeTestCase(
        data.code,
        languageId,
        tc.input,
        tc.output,
        problem.timeLimit || DEFAULT_LIMITS.TIME_LIMIT_MS,
        {
          judge0Url,
          rapidApiKey,
          rapidApiHost,
        }
      );
      results.push({
        status: result.status,
        input: tc.input,
        expectedOutput: tc.output,
        actualOutput: result.actualOutput,
        time: result.time,
        memory: result.memory,
        error: result.error,
      });
    }

    return results;
  }
}

export const submissionService = new SubmissionService();
