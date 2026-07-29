import type { IMatch } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';
export declare class MatchRepository {
    private readonly http;
    constructor(http: HttpClient);
    getMatches(query?: Record<string, unknown>): Promise<ApiResponse<IMatch[]>>;
    getMatch(id: string): Promise<ApiResponse<IMatch>>;
    private buildQueryString;
}
