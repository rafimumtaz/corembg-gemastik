import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { ZodError } from 'zod';
import { config } from '../config/index.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message);
  }

  if (err instanceof ZodError) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid input data: ' + err.issues.map((e: any) => e.message).join(', '));
  }

  console.error('Unhandled error:', err);
  const message = config.nodeEnv === 'development' ? err.message : 'Internal server error';
  return sendError(res, 500, 'INTERNAL_SERVER_ERROR', message);
};
