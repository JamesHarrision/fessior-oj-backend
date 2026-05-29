import mongoose from 'mongoose';
import { prisma } from '../config/prisma';

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
