import { Problem } from '../models/problem.model';
import { Submission } from '../models/submission.model';
import { submissionQueue } from '../config/queue';
import { AppError } from '@ocj/errors';
import mongoose from 'mongoose';

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
}

export const submissionService = new SubmissionService();
