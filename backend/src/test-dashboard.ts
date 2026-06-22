import express from 'express';
import dashboardRouter from './routes/dashboard';

const app = express();
const PORT = 4002;

app.use(express.json());
app.use('/', dashboardRouter);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Test dashboard server running on http://localhost:${PORT}`);
  });
}
