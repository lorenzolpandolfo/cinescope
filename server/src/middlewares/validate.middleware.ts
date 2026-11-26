import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readBody(req: Request): Record<string, unknown> {
  if (typeof req.body !== 'object' || req.body === null) {
    return {};
  }
  return req.body as Record<string, unknown>;
}

function fail(errors: string[]): never {
  throw new AppError(400, 'Validation failed', errors);
}

export function validateRegister(req: Request, _res: Response, next: NextFunction): void {
  const body = readBody(req);
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const errors: string[] = [];

  if (name.length < 2 || name.length > 80) {
    errors.push('Name must be between 2 and 80 characters');
  }
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.push('A valid email is required');
  }
  if (password.length < 8 || password.length > 72) {
    errors.push('Password must be between 8 and 72 characters');
  }
  if (errors.length > 0) {
    fail(errors);
  }

  req.body = { name, email, password };
  next();
}

export function validateLogin(req: Request, _res: Response, next: NextFunction): void {
  const body = readBody(req);
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const errors: string[] = [];

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.push('A valid email is required');
  }
  if (password.length === 0) {
    errors.push('Password is required');
  }
  if (errors.length > 0) {
    fail(errors);
  }

  req.body = { email, password };
  next();
}

export function validateNameUpdate(req: Request, _res: Response, next: NextFunction): void {
  const body = readBody(req);
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (name.length < 2 || name.length > 80) {
    fail(['Name must be between 2 and 80 characters']);
  }

  req.body = { name };
  next();
}

export function validateLibraryCreate(req: Request, _res: Response, next: NextFunction): void {
  const body = readBody(req);
  const tmdbId = body.tmdbId;

  if (typeof tmdbId !== 'number' || !Number.isInteger(tmdbId) || tmdbId <= 0) {
    fail(['tmdbId must be a positive integer']);
  }

  req.body = { tmdbId };
  next();
}

export function validateSearchQuery(req: Request, res: Response, next: NextFunction): void {
  const rawQuery = req.query.query;
  const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';

  if (query.length < 1 || query.length > 100) {
    fail(['Query must be between 1 and 100 characters']);
  }

  res.locals.searchQuery = query;
  next();
}
