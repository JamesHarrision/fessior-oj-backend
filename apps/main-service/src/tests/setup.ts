import mongoose from 'mongoose';
import { prisma } from '../config/prisma';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Tải .env của main-service
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Tải thêm các key API từ .env.docker ở thư mục gốc nếu chưa được định nghĩa ở host
const dockerEnvPath = path.resolve(__dirname, '../../../../.env.docker');
if (fs.existsSync(dockerEnvPath)) {
  const dockerEnv = dotenv.parse(fs.readFileSync(dockerEnvPath));
  if (dockerEnv.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = dockerEnv.GEMINI_API_KEY;
  }
  if (dockerEnv.RAPIDAPI_KEY && !process.env.RAPIDAPI_KEY) {
    process.env.RAPIDAPI_KEY = dockerEnv.RAPIDAPI_KEY;
  }
  if (dockerEnv.RAPIDAPI_HOST && !process.env.RAPIDAPI_HOST) {
    process.env.RAPIDAPI_HOST = dockerEnv.RAPIDAPI_HOST;
  }
  if (dockerEnv.JUDGE0_URL && !process.env.JUDGE0_URL) {
    process.env.JUDGE0_URL = dockerEnv.JUDGE0_URL;
  }
}

// Nếu URL trỏ đến host.docker.internal (trong môi trường docker), chuyển thành localhost để chạy ở host
if (process.env.JUDGE0_URL === 'http://host.docker.internal:2358') {
  process.env.JUDGE0_URL = 'http://localhost:2358';
}

beforeAll(async () => {
  // Kết nối MongoDB nếu chưa kết nối
  const mongoUri = process.env.MONGO_URI || 'mongodb://mongoadmin:mongosecret@localhost:27017/ocj_database_test?authSource=admin';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
});

afterAll(async () => {
  // Đóng kết nối MongoDB
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  // Đóng kết nối Prisma
  await prisma.$disconnect();
});
