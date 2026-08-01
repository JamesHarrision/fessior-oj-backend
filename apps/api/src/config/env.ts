import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { z } from "zod";

// ==========================================
// Bước 1 — Xác định đường dẫn .env
// ==========================================
// Đi ngược 4 cấp thư mục từ config/ để về root dự án 
const rootEnvPath = fileURLToPath(
  new URL("../../../../.env", import.meta.url),
);

// ==========================================
// Bước 2 — Load file nếu tồn tại
// ==========================================
if (existsSync(rootEnvPath)) {
  loadEnvFile(rootEnvPath);
} else {
  // Không crash, tiếp tục để lấy biến môi trường từ nền tảng deploy (Docker, AWS, Vercel...)
  console.log("ℹ️ [Env] No .env file found at root. Using system environment variables.");
}

// ==========================================
// Bước 3 — Tạo schema
// ==========================================
const apiEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .default("info"),

  API_PORT: z
    .coerce // Tự động chuyển chuỗi "3000" thành số 3000
    .number("INVALID_VALUE")
    .int("Must be an integer")
    .min(1, "Must be between 1 and 65535")
    .max(65535, "Must be between 1 and 65535")
    .default(3000),

  REDIS_URL: z.string().min(1),
});

// ==========================================
// Bước 4 — Parse bằng safeParse
// ==========================================
const result = apiEnvSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid API environment configuration:");

  // Duyệt qua từng lỗi để in ra lỗi
  result.error.issues.forEach((issue) => {
    const fieldName = issue.path.join(".");
    console.error(`- ${fieldName}: ${issue.message}`);
  });

  // Kết thúc process với mã lỗi 1
  process.exit(1);
}

// ==========================================
// Bước 5 — Export dữ liệu hợp lệ
// ==========================================
// Type của `env` lúc này sẽ được tự động suy luận (infer) chính xác nhờ Zod và TypeScript
export const env = result.data;
