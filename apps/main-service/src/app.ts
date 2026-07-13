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
import userRoutes from './routes/user.route';
import newsRoutes from './routes/news.route';
import roadmapRoutes from './routes/roadmap.route';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger-output.json';
import { errorMiddleware } from './middlewares/error.middleware';
import { API_ROUTES } from '@ocj/constants';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(`/api/v1${API_ROUTES.AUTH}`, authRoutes);
app.use(`/api/v1${API_ROUTES.USER}`, userRoutes);
app.use(`/api/v1${API_ROUTES.PROBLEMS}`, problemRoutes);
app.use(`/api/v1${API_ROUTES.SUBMISSIONS}`, submissionRoutes);
app.use(`/api/v1${API_ROUTES.AI}`, aiRoutes);
app.use(`/api/v1${API_ROUTES.LEADERBOARD}`, leaderboardRoutes);
app.use(`/api/v1${API_ROUTES.ROOMS}`, roomRoutes);
app.use(`/api/v1${API_ROUTES.MATCHES}`, matchRoutes);
app.use(`/api/v1${API_ROUTES.CONTESTS}`, contestRoutes);
app.use(`/api/v1${API_ROUTES.COMMENTS}`, commentRoutes);
app.use(`/api/v1${API_ROUTES.FRIENDS}`, friendshipRoutes);
app.use(`/api/v1${API_ROUTES.SHOP}`, shopRoutes);
app.use(`/api/v1${API_ROUTES.NOTIFICATIONS}`, notificationRoutes);
app.use(`/api/v1${API_ROUTES.REPORTS}`, reportRoutes);
app.use(`/api/v1${API_ROUTES.ROADMAPS}`, roadmapRoutes);
app.use('/api/v1/news', newsRoutes);

app.get('/', async (req, res) => {
  const userCount = await prisma.user.count();
  return res.status(200).json({
    status: "Success",
    message: "Welcome x 3.14",
    userCount
  })
});

// Global error handler middleware should be at the end of route declarations
app.use(errorMiddleware);

export default app;