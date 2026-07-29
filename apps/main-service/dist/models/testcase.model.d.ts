import { Document, Types } from 'mongoose';
export interface ITestcase extends Document {
    problemId: Types.ObjectId;
    isExample: boolean;
    input: string;
    output: string;
}
export declare const Testcase: import("mongoose").Model<ITestcase, {}, {}, {}, Document<unknown, {}, ITestcase, {}, import("mongoose").DefaultSchemaOptions> & ITestcase & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITestcase>;
