import { Worker } from "bullmq";

import {
  createRedisConnectionOptions,
  QUEUE_NAMES,
  SYSTEM_JOB_NAMES,
} from "@fessior/queue";

import type {
  HealthCheckJobData,
  HealthCheckJobResult,
} from "@fessior/queue";

import { env } from "../config/env.js";

export const systemWorker = new Worker<
  HealthCheckJobData,
  HealthCheckJobResult
>(
  QUEUE_NAMES.SYSTEM,
  async (job) => {
    if (job.name !== SYSTEM_JOB_NAMES.HEALTH_CHECK) {
      throw new Error(`Unsupported system job: ${job.name}`);
    }

    console.log({
      event: "job_started",
      jobId: job.id,
      jobName: job.name,
      data: job.data,
    });

    const result: HealthCheckJobResult = {
      processedAt: new Date().toISOString(),
      workerProcessId: process.pid,
    };

    console.log({
      event: "job_completed",
      jobId: job.id,
      result,
    });

    return result;
  },
  {
    connection: createRedisConnectionOptions(env.REDIS_URL),
    concurrency: env.WORKER_CONCURRENCY,
  },
);

systemWorker.on("ready", () => {
  console.log("System worker is ready");
});

systemWorker.on("completed", (job, result) => {
  console.log({
    event: "worker_completed",
    jobId: job.id,
    result,
  });
});

systemWorker.on("failed", (job, error) => {
  console.error({
    event: "worker_failed",
    jobId: job?.id ?? "unknown",
    message: error.message,
  });
});

systemWorker.on("error", (error) => {
  console.error("System worker error:", error);
});