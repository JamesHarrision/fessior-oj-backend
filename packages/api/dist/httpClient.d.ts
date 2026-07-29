import type { HttpMethod } from './types';
export interface HttpClientConfig {
    baseUrl: string;
    getAccessToken?: () => string | null;
    onUnauthorized?: () => void;
}
export declare class HttpClient {
    private readonly baseUrl;
    private readonly getAccessToken?;
    private readonly onUnauthorized?;
    constructor(config: HttpClientConfig);
    request<TData>(method: HttpMethod, path: string, options?: {
        body?: unknown;
        headers?: Record<string, string>;
    }): Promise<TData>;
}
