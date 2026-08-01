export const SYSTEM_JOB_NAMES = {
  HEALTH_CHECK: "health-check",
} as const;

export type HealthCheckJobData = {
  requestedAt: string;
  requestedBy: string;
};

export type HealthCheckJobResult = {
  processedAt: string;
  workerProcessId: number;
};