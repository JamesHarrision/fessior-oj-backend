import mongoose from 'mongoose';
export declare class SubmissionService {
    submit(userId: string, data: {
        problemId: string;
        code: string;
        language: 'cpp' | 'java' | 'python';
        matchId?: string;
        contestId?: string;
    }): Promise<mongoose.Document<unknown, {}, import("../models/submission.model").ISubmission, {}, mongoose.DefaultSchemaOptions> & import("../models/submission.model").ISubmission & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getSubmissionDetails(submissionId: string, userId: string, isAdmin?: boolean): Promise<mongoose.Document<unknown, {}, import("../models/submission.model").ISubmission, {}, mongoose.DefaultSchemaOptions> & import("../models/submission.model").ISubmission & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getUserSubmissions(userId: string, filters: {
        problemId?: string;
        page: number;
        limit: number;
    }): Promise<{
        total: number;
        page: number;
        limit: number;
        items: (mongoose.Document<unknown, {}, import("../models/submission.model").ISubmission, {}, mongoose.DefaultSchemaOptions> & import("../models/submission.model").ISubmission & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    runCode(data: {
        problemId?: string;
        code: string;
        language: 'cpp' | 'java' | 'python';
        customInput?: string;
    }): Promise<any[]>;
}
export declare const submissionService: SubmissionService;
