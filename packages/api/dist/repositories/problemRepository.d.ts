import type { IProblem, ISubmission, ITag, ProblemListQuery, CreateProblemRequest, UpdateProblemRequest } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';
export declare class ProblemRepository {
    private readonly http;
    constructor(http: HttpClient);
    getProblems(query?: ProblemListQuery): Promise<ApiResponse<IProblem[]>>;
    getProblem(slug: string): Promise<ApiResponse<IProblem>>;
    createProblem(data: CreateProblemRequest): Promise<ApiResponse<IProblem>>;
    updateProblem(id: string, data: UpdateProblemRequest): Promise<ApiResponse<IProblem>>;
    deleteProblem(id: string): Promise<ApiResponse<void>>;
    getTags(): Promise<ApiResponse<ITag[]>>;
    getTestcases(problemId: string, isExample?: boolean): Promise<ApiResponse<ISubmission[]>>;
    createTestcase(problemId: string, data: Record<string, unknown>): Promise<ApiResponse<ISubmission>>;
    deleteTestcase(problemId: string, testcaseId: string): Promise<ApiResponse<void>>;
    private buildQueryString;
}
