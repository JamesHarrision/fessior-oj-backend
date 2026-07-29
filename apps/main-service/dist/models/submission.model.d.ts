import { Document, Types } from 'mongoose';
export interface ISubmission extends Document {
    userId: string;
    problemId: Types.ObjectId;
    code: string;
    language: 'cpp' | 'java' | 'python';
    status: 'PENDING' | 'PROCESSING' | 'ACCEPTED' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE';
    executionTime?: number;
    memoryUsed?: number;
    errorMessage?: string;
    testCasesPassed: number;
    testCasesTotal: number;
    aiFeedback?: string;
    matchId?: string;
    contestId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Submission: import("mongoose").Model<ISubmission, {}, {}, {}, Document<unknown, {}, ISubmission, {}, import("mongoose").DefaultSchemaOptions> & ISubmission & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISubmission>;
