import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../errors';

export interface AuthenticatedRequest extends Request { userId?: string; }

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token = req.header('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return next(new ApiError(401, 'UNAUTHORIZED', 'A bearer access token is required.'));
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (typeof payload === 'string' || typeof payload.sub !== 'string') throw new Error('Invalid subject');
    req.userId = payload.sub;
    return next();
  } catch {
    return next(new ApiError(401, 'UNAUTHORIZED', 'The access token is invalid or expired.'));
  }
}
