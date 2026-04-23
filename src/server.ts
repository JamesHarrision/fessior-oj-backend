import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectMongoDB } from './config/mongodb.config';

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectMongoDB();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Khởi động server thất bại", error);
  }
};

startServer();