import { Queue } from 'bullmq';
import { redisOptions } from './redis';

export const submissionQueue = new Queue('submission_queue', {
  connection: redisOptions,
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
