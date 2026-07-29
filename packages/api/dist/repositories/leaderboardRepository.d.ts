import type { ILeaderboardEntry, LeaderboardQuery } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';
export declare class LeaderboardRepository {
    private readonly http;
    constructor(http: HttpClient);
    getLeaderboard(query?: LeaderboardQuery): Promise<ApiResponse<ILeaderboardEntry[]>>;
    private buildQueryString;
}
