import express from 'express';
import authRouter from './routes/auth';

const app = express();
app.use(express.json());
app.use('/', authRouter);

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Test auth server running on http://localhost:${PORT}`);
});
