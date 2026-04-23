import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import UserModel from './models/user.model';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
  try {
    const count = await UserModel.countDocuments();
    return res.status(200).json({
      message: "Welcome to fessior oj",
      users: {
        count: count
      }
    })
  } catch (error) {
    console.log("Lỗi kết nối mongodb");
  }
});

export default app;