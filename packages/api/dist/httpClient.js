import { ApiError } from './types';
export class HttpClient {
    baseUrl;
    getAccessToken;
    onUnauthorized;
    constructor(config) {
        this.baseUrl = config.baseUrl.replace(/\/+$/, '');
        this.getAccessToken = config.getAccessToken;
        this.onUnauthorized = config.onUnauthorized;
    }
    async request(method, path, options) {
        const url = `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
        const accessToken = this.getAccessToken?.() ?? null;
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                ...(options?.headers ?? {}),
            },
            ...(options?.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
        });
        const payload = (await res.json().catch(() => null));
        if (res.status === 401) {
            this.onUnauthorized?.();
        }
        if (!res.ok) {
            const message = payload?.message ?? 'Request failed';
            throw new ApiError(message, { statusCode: res.status, payload });
        }
        if (!payload || payload.status !== 'Success' || payload.data === undefined) {
            throw new ApiError(payload?.message ?? 'Invalid response', { statusCode: res.status, payload });
        }
        return payload.data;
    }
}
