import { API_ROUTES } from '@ocj/constants';
import type { ILeaderboardEntry, LeaderboardQuery } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';

export class LeaderboardRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getLeaderboard(query?: LeaderboardQuery): Promise<ApiResponse<ILeaderboardEntry[]>> {
    const params = query ? this.buildQueryString(query) : '';
    const path = params ? `${API_ROUTES.LEADERBOARD}?${params}` : API_ROUTES.LEADERBOARD;
    return this.http.request('GET', path);
  }

  private buildQueryString(query: any): string {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
    }
    return parts.join('&');
  }
}
