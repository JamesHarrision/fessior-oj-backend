import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const rootEnvPath = fileURLToPath(
  new URL("../../../../.env", import.meta.url),
);

if (existsSync(rootEnvPath)) {
  loadEnvFile(rootEnvPath);
} else {
  console.log("ℹ️ [Env] No .env file found at root. Using system environment variables.");
}

const workerEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .default("info"),

  WORKER_CONCURRENCY: z
    .coerce // Tự động chuyển chuỗi "3000" thành số 3000
    .number("INVALID_VALUE")
    .int("Must be an integer")
    .min(1, "Must be between 1 and 20")
    .max(20, "Must be between 1 and 20")
    .default(1),

  REDIS_URL: z.string().min(1),
});

const result = workerEnvSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid API environment configuration:");

  // Duyệt qua từng lỗi để in ra lỗi
  result.error.issues.forEach((issue) => {
    const fieldName = issue.path.join(".");
    console.error(`- ${fieldName}: ${issue.message}`);
  });

  process.exit(1);
}

export const env = result.data;
