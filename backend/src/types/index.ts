export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface AuthPayload {
  userId: string;
  email: string;
}

import { Request } from 'express';
export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface AppError extends Error {
  status?: number;
  statusCode?: number;
}
