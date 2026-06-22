import { Request, Response, NextFunction } from 'express';
import { ApiResponse, AppError } from '../types';

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const statusCode = err.status || err.statusCode || 500;
  const response: ApiResponse<null> = {
    data: null,
    error: err.message || 'Internal Server Error',
  };

  res.status(statusCode).json(response);
};

export default errorHandler;
