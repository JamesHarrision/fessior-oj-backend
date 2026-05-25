import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { prisma } from './config/prisma';
import authRoutes from './routes/auth.route';
import problemRoutes from './routes/problem.route';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/problems', problemRoutes);

app.get('/', async (req, res) => {
  const userCount = await prisma.user.findMany();
  return res.status(200).json({
    status: "Success",
    message: "Welcome x 3.14",
    userCount
  })
});


export default app;