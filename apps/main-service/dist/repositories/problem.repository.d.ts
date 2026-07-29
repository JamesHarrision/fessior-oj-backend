import { IProblem } from '../models/problem.model';
import { ITestcase } from '../models/testcase.model';
import { Difficulty } from '@prisma/client';
export declare class ProblemRepository {
    createProblem(data: Partial<IProblem> & {
        tags?: string[];
    }): Promise<import("mongoose").Document<unknown, {}, IProblem, {}, import("mongoose").DefaultSchemaOptions> & IProblem & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateProblem(mongoId: string, data: Partial<IProblem> & {
        tags?: string[];
    }): Promise<import("mongoose").Document<unknown, {}, IProblem, {}, import("mongoose").DefaultSchemaOptions> & IProblem & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteProblem(mongoId: string): Promise<boolean>;
    getProblemBySlug(slug: string): Promise<{
        tags: {
            id: string;
            name: string;
            slug: string;
            color: string | null;
        }[];
        title: string;
        slug: string;
        description: string;
        difficulty: "EASY" | "MEDIUM" | "HARD";
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
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    getProblemsList(filters: {
        difficulty?: Difficulty;
        tagSlug?: string;
        page: number;
        limit: number;
        userId?: string;
    }): Promise<{
        total: number;
        page: number;
        limit: number;
        items: {
            id: string;
            title: string;
            slug: string;
            difficulty: import(".prisma/client").$Enums.Difficulty;
            created_at: Date;
            tags: {
                id: string;
                name: string;
                slug: string;
                color: string | null;
            }[];
            acceptanceRate: any;
            totalSubmissions: any;
            isSolved: boolean;
        }[];
    }>;
    addTestcase(problemId: string, data: {
        isExample: boolean;
        input: string;
        output: string;
    }): Promise<import("mongoose").Document<unknown, {}, ITestcase, {}, import("mongoose").DefaultSchemaOptions> & ITestcase & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getTestcases(problemId: string, excludeHidden?: boolean): Promise<(import("mongoose").Document<unknown, {}, ITestcase, {}, import("mongoose").DefaultSchemaOptions> & ITestcase & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    deleteTestcase(testcaseId: string): Promise<import("mongoose").Document<unknown, {}, ITestcase, {}, import("mongoose").DefaultSchemaOptions> & ITestcase & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
export declare const problemRepository: ProblemRepository;
