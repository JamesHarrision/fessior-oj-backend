import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.log("[Lỗi kết nối Mongodb], biến môi trường MONGO_URI chưa được thiết lập");
  process.exit(1);
}

export const connectMongoDB = async (): Promise<void> => {
  try {
    const connection = await mongoose.connect(MONGO_URI);
    console.log("MongDB đã được kết nối thành công");
  } catch (error: any) {
    console.error(`Lỗi kết nối MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
}

mongoose.connection.on('connected', () => {
  console.log('Mongoose event: connected');
});

mongoose.connection.on('error', (err) => {
  console.log(`Mongoose event: error - ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose event: disconnected');
});


process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection bị ngắt do ứng dụng kết thúc');
  process.exit(0);
});
