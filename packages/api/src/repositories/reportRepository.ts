import { API_ROUTES } from '@ocj/constants';
import type { IReport, ReportStatus, CreateReportRequest } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';

export class ReportRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getReports(query?: Record<string, unknown>): Promise<ApiResponse<IReport[]>> {
    const params = query ? this.buildQueryString(query) : '';
    const path = params ? `${API_ROUTES.REPORTS}?${params}` : API_ROUTES.REPORTS;
    return this.http.request('GET', path);
  }

  getMyReports(): Promise<ApiResponse<IReport[]>> {
    return this.http.request('GET', `${API_ROUTES.REPORTS}/my`);
  }

  createReport(data: CreateReportRequest): Promise<ApiResponse<IReport>> {
    return this.http.request('POST', API_ROUTES.REPORTS, { body: data });
  }

  updateReportStatus(id: string, status: ReportStatus): Promise<ApiResponse<IReport>> {
    return this.http.request('PATCH', `${API_ROUTES.REPORTS}/${id}/status`, { body: { status } });
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
