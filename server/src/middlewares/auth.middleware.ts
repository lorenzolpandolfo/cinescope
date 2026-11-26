import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserModel, type UserDocument } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;

  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError(401, 'Invalid authorization header');
  }

  return token;
}

async function resolveUser(token: string): Promise<UserDocument> {
  let payload: JwtPayload;

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (typeof decoded === 'string') {
      throw new Error('Invalid token payload');
    }

    payload = decoded;
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }

  if (!payload.sub) {
    throw new AppError(401, 'Invalid or expired token');
  }

  const user = await UserModel.findById(payload.sub);

  if (!user) {
    throw new AppError(401, 'Invalid or expired token');
  }

  return user;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AppError(401, 'Authentication required');
    }

    req.user = await resolveUser(token);
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      next();
      return;
    }

    req.user = await resolveUser(token);
    next();
  } catch (error) {
    next(error);
  }
}
