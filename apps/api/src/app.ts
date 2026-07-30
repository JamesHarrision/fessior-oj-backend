import express from "express"
import cors from 'cors';
import helmet from 'helmet'

import healthRoutes from './routes/health.route.js'

import { notFoundHandler } from "./middlewares/not-found-handler.js";
import { errorHandler } from "./middlewares/error-handler.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);

// --- ĐĂNG KÝ MIDDLEWARE MỚI TẠI ĐÂY ---
// 1. Bắt tất cả các request không khớp route nào phía trên (Xử lý 404)
app.use(notFoundHandler);

// 2. Tiếp nhận tất cả các lỗi xảy ra trong toàn bộ hệ thống (Xử lý 500)
// LƯU Ý: Middleware xử lý lỗi có 4 tham số PHẢI được đặt ở vị trí sau cùng
app.use(errorHandler);

export default app;