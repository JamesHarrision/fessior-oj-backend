import { API_ROUTES } from '@ocj/constants';
import type {
  IContest,
  IContestScoreboardEntry,
  CreateContestRequest,
  UpdateContestRequest,
} from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';

export class ContestRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getContests(query?: Record<string, unknown>): Promise<ApiResponse<IContest[]>> {
    const params = query ? this.buildQueryString(query) : '';
    const path = params ? `${API_ROUTES.CONTESTS}?${params}` : API_ROUTES.CONTESTS;
    return this.http.request('GET', path);
  }

  getContest(id: string): Promise<ApiResponse<IContest>> {
    return this.http.request('GET', `${API_ROUTES.CONTESTS}/${id}`);
  }

  createContest(data: CreateContestRequest): Promise<ApiResponse<IContest>> {
    return this.http.request('POST', API_ROUTES.CONTESTS, { body: data });
  }

  updateContest(id: string, data: UpdateContestRequest): Promise<ApiResponse<IContest>> {
    return this.http.request('PUT', `${API_ROUTES.CONTESTS}/${id}`, { body: data });
  }

  deleteContest(id: string): Promise<ApiResponse<void>> {
    return this.http.request('DELETE', `${API_ROUTES.CONTESTS}/${id}`);
  }

  register(id: string): Promise<ApiResponse<void>> {
    return this.http.request('POST', `${API_ROUTES.CONTESTS}/${id}/register`);
  }

  unregister(id: string): Promise<ApiResponse<void>> {
    return this.http.request('DELETE', `${API_ROUTES.CONTESTS}/${id}/register`);
  }

  getScoreboard(id: string): Promise<ApiResponse<IContestScoreboardEntry[]>> {
    return this.http.request('GET', `${API_ROUTES.CONTESTS}/${id}/scoreboard`);
  }

  endContest(id: string): Promise<ApiResponse<any>> {
    return this.http.request('POST', `${API_ROUTES.CONTESTS}/${id}/end`);
  }

  getContestProblems(id: string): Promise<ApiResponse<any[]>> {
    return this.http.request('GET', `${API_ROUTES.CONTESTS}/${id}/problems`);
  }

  getContestSubmissions(id: string): Promise<ApiResponse<any[]>> {
    return this.http.request('GET', `${API_ROUTES.CONTESTS}/${id}/submissions`);
  }

  private buildQueryString(query: Record<string, unknown>): string {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
    }
    return parts.join('&');
  }
}
