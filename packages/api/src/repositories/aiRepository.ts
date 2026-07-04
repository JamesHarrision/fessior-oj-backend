import { API_ROUTES } from '@ocj/constants';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';

export class AiRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getRoadmap(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.http.request('GET', `${API_ROUTES.AI}/roadmap`);
  }

  getFeedback(submissionId: string): Promise<ApiResponse<string>> {
    return this.http.request('GET', `${API_ROUTES.AI}/feedback/${submissionId}`);
  }
}
