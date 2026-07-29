import type { ISubmission, SubmitCodeRequest, RunCodeRequest, SubmissionListQuery } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';
export declare class SubmissionRepository {
    private readonly http;
    constructor(http: HttpClient);
    submit(data: SubmitCodeRequest): Promise<ApiResponse<ISubmission>>;
    run(data: RunCodeRequest): Promise<ApiResponse<ISubmission>>;
    getSubmissions(query?: SubmissionListQuery): Promise<ApiResponse<ISubmission[]>>;
    getSubmission(id: string): Promise<ApiResponse<ISubmission>>;
    private buildQueryString;
}
