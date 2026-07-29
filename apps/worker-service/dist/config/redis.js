"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.redisOptions = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
exports.redisOptions = {
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: null,
};
exports.redis = new ioredis_1.default(exports.redisOptions);
exports.redis.on('connect', () => {
    console.log('Redis connected successfully in worker-service');
});
exports.redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});
