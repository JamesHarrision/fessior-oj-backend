import type { IContest, IContestScoreboardEntry, CreateContestRequest, UpdateContestRequest } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';
export declare class ContestRepository {
    private readonly http;
    constructor(http: HttpClient);
    getContests(query?: Record<string, unknown>): Promise<ApiResponse<IContest[]>>;
    getContest(id: string): Promise<ApiResponse<IContest>>;
    createContest(data: CreateContestRequest): Promise<ApiResponse<IContest>>;
    updateContest(id: string, data: UpdateContestRequest): Promise<ApiResponse<IContest>>;
    deleteContest(id: string): Promise<ApiResponse<void>>;
    register(id: string): Promise<ApiResponse<void>>;
    unregister(id: string): Promise<ApiResponse<void>>;
    getScoreboard(id: string): Promise<ApiResponse<IContestScoreboardEntry[]>>;
    endContest(id: string): Promise<ApiResponse<any>>;
    getContestProblems(id: string): Promise<ApiResponse<any[]>>;
    getContestSubmissions(id: string): Promise<ApiResponse<any[]>>;
    private buildQueryString;
}
