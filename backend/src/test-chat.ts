import express from 'express';
import chatRouter from './routes/chat';

const app = express();
const PORT = 4003;

app.use(express.json());
// Mount at /api/chat so paths match the main app (e.g. GET /api/chat/rooms)
app.use('/api/chat', chatRouter);

app.listen(PORT, () => {
  console.log(`Test chat server running on http://localhost:${PORT}`);
});
