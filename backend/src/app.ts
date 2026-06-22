import express, { Request, Response } from 'express';
import corsMiddleware from './middleware/cors';
import errorHandler from './middleware/errorHandler';
import authRouter from './routes/auth';
import dashboardRouter from './routes/dashboard';
import chatRouter from './routes/chat';

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/chat', chatRouter);

// 404 catch-all
app.use((_req: Request, res: Response) => {
  res.status(404).json({ data: null, error: 'Not Found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
