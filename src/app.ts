import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
	
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome welcome welcome x 3.14',
    status: 'success',
  });
});

export default app;