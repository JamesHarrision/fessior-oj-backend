import type { ErrorRequestHandler } from "express";
import { env } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  next,
) => {
  // Nếu header đã được gửi đi rồi, Express yêu cầu phải chuyển tiếp lỗi cho middleware mặc định
  if (response.headersSent) {
    next(error);
    return;
  }

  // 1. Luôn ghi log lỗi chi tiết tại server để bạn dễ dàng debug khi code lỗi
  console.error(error);

  // 2. Định nghĩa thông điệp lỗi (message) dựa theo môi trường cấu hình (env)
  let errorMessage = "Internal server error"; // Mặc định cho Production

  if (env.NODE_ENV === "development") {
    // Nếu ở môi trường dev, kiểm tra xem biến lỗi có phải thực thể của Error hay không
    errorMessage = error instanceof Error ? error.message : "Unknown error";
  }

  // 3. Trả về mã lỗi HTTP 500 cùng cấu trúc JSON bảo mật (không lộ stack trace)
  response.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: errorMessage,
    },
  });
};
