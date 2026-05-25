import dotenv from 'dotenv'

dotenv.config();

import app from './app';
import { connectMongoDB } from './config/mongoose';

const PORT = process.env.PORT || 6868;

const startServer = async () => {
  await connectMongoDB();
  
  app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
  });
};

startServer();


