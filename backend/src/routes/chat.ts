import { Router, Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { ChatRoom, ChatMessage, SendMessageBody } from '../types/chat';

const router = Router();

// Warn if JWT_SECRET is not set
if (!process.env.JWT_SECRET) {
  console.warn('[WARN] JWT_SECRET not set — using insecure dev-secret');
}

// In-memory stores
const rooms = new Map<string, ChatRoom>();
const messages = new Map<string, ChatMessage[]>();

// Seed 2 default rooms on startup
const defaultRooms: ChatRoom[] = [
  { id: '1', name: 'General', createdAt: new Date().toISOString() },
  { id: '2', name: 'Random', createdAt: new Date().toISOString() },
];

for (const room of defaultRooms) {
  rooms.set(room.id, room);
  messages.set(room.id, []);
}

// Auth middleware
function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ data: null, error: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET || 'dev-secret';

  try {
    const decoded = jwt.verify(token, secret);
    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof (decoded as any).userId !== 'string' ||
      (decoded as any).userId === '' ||
      typeof (decoded as any).email !== 'string' ||
      (decoded as any).email === ''
    ) {
      res.status(401).json({ data: null, error: 'Unauthorized' });
      return;
    }
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ data: null, error: 'Unauthorized' });
  }
}

// GET /rooms (public)
router.get('/rooms', (_req: Request, res: Response) => {
  const roomList = Array.from(rooms.values());
  res.json({ data: { rooms: roomList }, error: null });
});

// GET /rooms/:id/messages (protected)
router.get('/rooms/:id/messages', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;

  if (!rooms.has(id)) {
    res.status(404).json({ data: null, error: 'Room not found' });
    return;
  }

  const roomMessages = messages.get(id) ?? [];
  res.json({ data: { messages: roomMessages }, error: null });
});

// POST /rooms/:id/messages (protected)
router.post('/rooms/:id/messages', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.body || typeof req.body.content !== 'string') {
    res.status(400).json({ data: null, error: 'content is required' });
    return;
  }

  const { content } = req.body as SendMessageBody;

  if (!rooms.has(id)) {
    res.status(404).json({ data: null, error: 'Room not found' });
    return;
  }

  if (!content || content.trim() === '') {
    res.status(400).json({ data: null, error: 'Content must not be empty' });
    return;
  }

  const user = (req as any).user as { userId: string; email: string };

  const newMessage: ChatMessage = {
    id: crypto.randomUUID(),
    roomId: id,
    userId: user.userId,
    email: user.email,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  const roomMessages = messages.get(id) ?? [];
  roomMessages.push(newMessage);

  res.status(201).json({ data: { message: newMessage }, error: null });
});

export default router;
