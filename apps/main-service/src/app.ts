import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { prisma } from './config/prisma';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
  const userCount = await prisma.user.findMany();
  return res.status(200).json({
    status: "Success",
    message: "Welcome x 3.14",
    userCount
  })
});

export default app;