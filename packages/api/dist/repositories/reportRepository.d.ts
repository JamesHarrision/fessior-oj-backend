import type { IReport, ReportStatus, CreateReportRequest } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';
export declare class ReportRepository {
    private readonly http;
    constructor(http: HttpClient);
    getReports(query?: Record<string, unknown>): Promise<ApiResponse<IReport[]>>;
    getMyReports(): Promise<ApiResponse<IReport[]>>;
    createReport(data: CreateReportRequest): Promise<ApiResponse<IReport>>;
    updateReportStatus(id: string, status: ReportStatus): Promise<ApiResponse<IReport>>;
    private buildQueryString;
}
