import { Document } from 'mongoose';
export interface IProblem extends Document {
    title: string;
    slug: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    timeLimit: number;
    memoryLimit: number;
    starterCodes: {
        cpp: string;
        java: string;
        python: string;
    };
    editorialMarkdown?: string;
    editorialVideoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Problem: import("mongoose").Model<IProblem, {}, {}, {}, Document<unknown, {}, IProblem, {}, import("mongoose").DefaultSchemaOptions> & IProblem & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProblem>;
