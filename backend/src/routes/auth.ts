import { Router, Request, Response } from 'express';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { User, RegisterBody, LoginBody, AuthPayload } from '../types/auth';

const router = Router();

// In-memory stores
const users = new Map<string, User>();
const tokenBlacklist = new Set<string>();

// Fix #2: Warn on missing JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
if (!process.env.JWT_SECRET) {
  console.warn('[WARN] JWT_SECRET not set — using insecure dev-secret');
}

// Fix #4: Secondary email index for O(1) lookups (email → userId)
const emailIndex = new Map<string, string>();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

// POST /register
router.post('/register', (req: Request, res: Response): void => {
  // Fix #3: Guard req.body before destructuring
  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({ data: null, error: 'Invalid request body' });
    return;
  }

  const { email, password } = req.body as RegisterBody;

  // Fix #5: Validate body field types
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ data: null, error: 'Email and password must be strings' });
    return;
  }

  // Fix #4: Normalize email to lowercase
  const normalizedEmail = email.toLowerCase().trim();

  if (!normalizedEmail || !password) {
    res.status(400).json({ data: null, error: 'Email and password are required' });
    return;
  }

  // Fix #4: Use emailIndex for O(1) duplicate check
  if (emailIndex.has(normalizedEmail)) {
    res.status(409).json({ data: null, error: 'Email already registered' });
    return;
  }

  const id = crypto.randomUUID();
  const passwordHash = hashPassword(password);
  const newUser: User = { id, email: normalizedEmail, passwordHash, createdAt: new Date() };
  users.set(id, newUser);
  emailIndex.set(normalizedEmail, id);

  const token = signToken({ userId: id, email: normalizedEmail });

  res.status(201).json({
    data: { token, user: { id, email: normalizedEmail } },
    error: null,
  });
});

// POST /login
router.post('/login', (req: Request, res: Response): void => {
  // Fix #3: Guard req.body before destructuring
  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({ data: null, error: 'Invalid request body' });
    return;
  }

  const { email, password } = req.body as LoginBody;

  // Fix #5: Validate body field types
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ data: null, error: 'Email and password must be strings' });
    return;
  }

  // Fix #4: Normalize email to lowercase
  const normalizedEmail = email.toLowerCase().trim();

  if (!normalizedEmail || !password) {
    res.status(400).json({ data: null, error: 'Email and password are required' });
    return;
  }

  // Fix #4: Use emailIndex for O(1) lookup
  const userId = emailIndex.get(normalizedEmail);
  const foundUser = userId ? users.get(userId) : undefined;

  if (!foundUser || foundUser.passwordHash !== hashPassword(password)) {
    res.status(401).json({ data: null, error: 'Invalid email or password' });
    return;
  }

  const token = signToken({ userId: foundUser.id, email: foundUser.email });

  res.status(200).json({
    data: { token, user: { id: foundUser.id, email: foundUser.email } },
    error: null,
  });
});

// POST /logout
router.post('/logout', (req: Request, res: Response): void => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({ data: null, error: 'Authorization token required' });
    return;
  }

  // Fix #1: Verify JWT before blacklisting to prevent DoS/forced-logout attacks
  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    res.status(401).json({ data: null, error: 'Invalid token' });
    return;
  }

  tokenBlacklist.add(token);

  res.status(200).json({
    data: { message: 'Logged out' },
    error: null,
  });
});

// GET /me
router.get('/me', (req: Request, res: Response): void => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({ data: null, error: 'Authorization token required' });
    return;
  }

  if (tokenBlacklist.has(token)) {
    res.status(401).json({ data: null, error: 'Token has been invalidated' });
    return;
  }

  let payload: unknown;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    res.status(401).json({ data: null, error: 'Invalid or expired token' });
    return;
  }

  // Fix #6: Runtime guard on JWT payload shape
  if (
    typeof payload !== 'object' ||
    payload === null ||
    typeof (payload as Record<string, unknown>).userId !== 'string' ||
    typeof (payload as Record<string, unknown>).email !== 'string'
  ) {
    res.status(401).json({ data: null, error: 'Invalid token payload' });
    return;
  }

  const typedPayload = payload as AuthPayload;
  const user = users.get(typedPayload.userId);
  if (!user) {
    res.status(401).json({ data: null, error: 'User not found' });
    return;
  }

  res.status(200).json({
    data: { id: user.id, email: user.email },
    error: null,
  });
});

export default router;
