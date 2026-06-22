import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DashboardSummary, DashboardStats } from '../types/dashboard';

const router = Router();

// Cache JWT_SECRET at module level
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
if (!process.env.JWT_SECRET) {
  console.warn('[WARN] JWT_SECRET not set — using insecure dev-secret');
}

// Narrow user type after verification
interface UserPayload {
  userId: string;
  email: string;
}

// Extend Express Request to include user payload
interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

// Inline auth middleware
function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    res.status(401).json({ data: null, error: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix (case-insensitive matched)
  if (!token) {
    res.status(401).json({ data: null, error: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });

    if (typeof decoded !== 'object' || decoded === null) {
      res.status(401).json({ data: null, error: 'Invalid or expired token' });
      return;
    }

    const payload = decoded as { userId?: string; email?: string };
    if (!payload.userId || !payload.email) {
      res.status(401).json({ data: null, error: 'Invalid or expired token' });
      return;
    }

    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ data: null, error: 'Invalid or expired token' });
      return;
    }
    next(err); // let errorHandler deal with infra failures
  }
}

// GET / — returns dashboard summary
router.get('/', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  const data: DashboardSummary = {
    title: 'Dashboard',
    description: 'Welcome to TalentPerformer',
    lastUpdated: new Date().toISOString(),
  };
  res.json({ data, error: null });
});

// GET /stats — returns dashboard stats
router.get('/stats', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  const data: DashboardStats = {
    totalUsers: 42,
    activeUsers: 18,
    totalMessages: 1337,
    uptime: Math.floor(process.uptime()) + 's',
  };
  res.json({ data, error: null });
});

export default router;
