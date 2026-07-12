import dotenv from 'dotenv'

dotenv.config();

import http from 'http';
import { Server as SocketServer } from 'socket.io';
import app from './app';
import { connectMongoDB } from './config/mongoose';
import { initSocket } from './sockets/socket';
import { startContestCron } from './workers/contest.cron';

const PORT = process.env.PORT || 6868;

const startServer = async () => {
  await connectMongoDB();
  
  const server = http.createServer(app);
  const io = new SocketServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  initSocket(io);
  startContestCron();

  server.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
  });
};

startServer();
