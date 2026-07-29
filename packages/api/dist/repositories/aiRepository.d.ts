import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';
export declare class AiRepository {
    private readonly http;
    constructor(http: HttpClient);
    getRoadmap(data: any): Promise<ApiResponse<Record<string, unknown>>>;
    getFeedback(submissionId: string): Promise<ApiResponse<string>>;
    getDebug(submissionId: string): Promise<ApiResponse<any>>;
    sendChatMessage(historyId: string, message: string): Promise<ApiResponse<any>>;
    getHistory(): Promise<ApiResponse<any[]>>;
}
