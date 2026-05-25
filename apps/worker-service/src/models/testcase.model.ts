import { Schema, model, Document, Types } from 'mongoose';

export interface ITestcase extends Document {
  problemId: Types.ObjectId;
  isExample: boolean;
  input: string;
  output: string;
}

const TestcaseSchema = new Schema<ITestcase>(
  {
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
    isExample: { type: Boolean, default: false },
    input: { type: String, required: true },
    output: { type: String, required: true },
  }
);

export const Testcase = model<ITestcase>('Testcase', TestcaseSchema);
