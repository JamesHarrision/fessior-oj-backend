import Redis from 'ioredis';
export declare const redisOptions: {
    host: string;
    port: number;
    maxRetriesPerRequest: any;
};
export declare const redis: Redis;
