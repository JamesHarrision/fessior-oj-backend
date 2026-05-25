import { Schema, model, Document, Types } from 'mongoose';

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
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: { type: String, required: true, index: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
    code: { type: String, required: true },
    language: { type: String, enum: ['cpp', 'java', 'python'], required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'ACCEPTED', 'WA', 'TLE', 'MLE', 'RE', 'CE'],
      default: 'PENDING',
      index: true,
    },
    executionTime: { type: Number },
    memoryUsed: { type: Number },
    errorMessage: { type: String },
    testCasesPassed: { type: Number, default: 0 },
    testCasesTotal: { type: Number, default: 0 },
    aiFeedback: { type: String },
  },
  { timestamps: true }
);

export const Submission = model<ISubmission>('Submission', SubmissionSchema);
