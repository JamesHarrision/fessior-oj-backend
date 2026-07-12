import { API_ROUTES } from '@ocj/constants';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';

export class AiRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getRoadmap(data: any): Promise<ApiResponse<Record<string, unknown>>> {
    return this.http.request('POST', `${API_ROUTES.AI}/roadmap`, data);
  }

  getFeedback(submissionId: string): Promise<ApiResponse<string>> {
    return this.http.request('POST', `${API_ROUTES.AI}/feedback/${submissionId}`);
  }

  getDebug(submissionId: string): Promise<ApiResponse<any>> {
    return this.http.request('POST', `${API_ROUTES.AI}/debug/${submissionId}`);
  }

  sendChatMessage(historyId: string, message: string): Promise<ApiResponse<any>> {
    return this.http.request('POST', `${API_ROUTES.AI}/interview/chat/${historyId}`, { body: { message } });
  }

  getHistory(): Promise<ApiResponse<any[]>> {
    return this.http.request('GET', `${API_ROUTES.AI}/history`);
  }
}
