import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { prisma } from './config/prisma';
import authRoutes from './routes/auth.route';
import problemRoutes from './routes/problem.route';
import submissionRoutes from './routes/submission.route';
import aiRoutes from './routes/ai.route';
import leaderboardRoutes from './routes/leaderboard.route';
import roomRoutes from './routes/room.route';
import matchRoutes from './routes/match_history.route';
import contestRoutes from './routes/contest.route';
import commentRoutes from './routes/comment.route';
import friendshipRoutes from './routes/friendship.route';
import shopRoutes from './routes/shop.route';
import notificationRoutes from './routes/notification.route';
import reportRoutes from './routes/report.route';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger-output.json';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/problems', problemRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/matches', matchRoutes);
app.use('/api/v1/contests', contestRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/friends', friendshipRoutes);
app.use('/api/v1/shop', shopRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportRoutes);


app.get('/', async (req, res) => {
  const userCount = await prisma.user.findMany();
  return res.status(200).json({
    status: "Success",
    message: "Welcome x 3.14",
    userCount
  })
});



export default app;