import { Router } from "express";
import { SYSTEM_JOB_NAMES } from "@fessior/queue";

import { systemQueue } from "../queues/system.queue.js";
import type { Request, Response } from "express";

const queueRouter = Router();

queueRouter.post("/jobs/health-check", async (_request: Request, response: Response) => {
  const job = await systemQueue.add(
    SYSTEM_JOB_NAMES.HEALTH_CHECK,
    {
      requestedAt: new Date().toISOString(),
      requestedBy: "api",
    },
  );

  response.status(202).json({
    success: true,
    data: {
      jobId: job.id,
      queueName: job.queueName,
      jobName: job.name,
      status: "queued",
    },
  });
});

export default queueRouter;