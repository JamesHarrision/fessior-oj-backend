"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
exports.submissionQueue = new bullmq_1.Queue('submission_queue', {
    connection: redis_1.redisOptions,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});
console.log('Submission Queue initialized successfully');
