import { Queue } from "bullmq";

import type {
  HealthCheckJobData,
  HealthCheckJobResult
} from './job-types.js'

import { QUEUE_NAMES } from "./queue-names.js";
import { createRedisConnectionOptions } from "./connection.js";

export function createSystemQueue(redisUrl: string) {
  return new Queue<
    HealthCheckJobData,
    HealthCheckJobResult,
    string
  >(QUEUE_NAMES.SYSTEM, {
    connection: createRedisConnectionOptions(redisUrl),
    defaultJobOptions: {
      removeOnComplete: 100, // Ghi lại 100 cái gần nhất
      removeOnFail: 500, // Nếu fail (thử lại 3 lần vẫn fail) -> Giữ lại 500 cái gần nhất
      attempts: 3,
      backoff: { // 1s -> 2s -> 4s -> ...
        type: "exponential",
        delay: 1_000,
      }, 
    }
  });
}