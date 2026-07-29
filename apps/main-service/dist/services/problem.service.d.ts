import { Difficulty } from '@prisma/client';
export declare class ProblemService {
    private slugify;
    createProblem(data: {
        title: string;
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
        tags?: string[];
    }): Promise<import("mongoose").Document<unknown, {}, import("../models/problem.model").IProblem, {}, import("mongoose").DefaultSchemaOptions> & import("../models/problem.model").IProblem & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateProblem(mongoId: string, data: {
        title?: string;
        description?: string;
        difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
        timeLimit?: number;
        memoryLimit?: number;
        starterCodes?: {
            cpp: string;
            java: string;
            python: string;
        };
        editorialMarkdown?: string;
        editorialVideoUrl?: string;
        tags?: string[];
    }): Promise<import("mongoose").Document<unknown, {}, import("../models/problem.model").IProblem, {}, import("mongoose").DefaultSchemaOptions> & import("../models/problem.model").IProblem & Required<{
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
        page?: number;
        limit?: number;
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
    createTag(name: string, color?: string): Promise<{
        id: string;
        name: string;
        slug: string;
        color: string | null;
    }>;
    getTags(): Promise<{
        id: string;
        name: string;
        slug: string;
        color: string | null;
    }[]>;
    addTestcase(problemId: string, isExample: boolean, input: string, output: string): Promise<import("mongoose").Document<unknown, {}, import("../models/testcase.model").ITestcase, {}, import("mongoose").DefaultSchemaOptions> & import("../models/testcase.model").ITestcase & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getTestcases(problemId: string, isExampleOnly?: boolean): Promise<(import("mongoose").Document<unknown, {}, import("../models/testcase.model").ITestcase, {}, import("mongoose").DefaultSchemaOptions> & import("../models/testcase.model").ITestcase & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    deleteTestcase(testcaseId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/testcase.model").ITestcase, {}, import("mongoose").DefaultSchemaOptions> & import("../models/testcase.model").ITestcase & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
export declare const problemService: ProblemService;
