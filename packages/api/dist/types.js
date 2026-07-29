export class ApiError extends Error {
    statusCode;
    payload;
    constructor(message, options) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = options?.statusCode;
        this.payload = options?.payload;
    }
}
