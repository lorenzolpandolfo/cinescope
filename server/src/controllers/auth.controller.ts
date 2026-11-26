import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserModel } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';
import { isDuplicateKeyError } from '../utils/duplicateKey.js';
import { toUserDto } from '../utils/mappers.js';

type RegisterBody = {
  name: string;
  email: string;
  password: string;
};

type LoginBody = {
  email: string;
  password: string;
};

function createToken(userId: string): string {
  return jwt.sign({}, env.jwtSecret, {
    subject: userId,
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body as RegisterBody;
  const existingUser = await UserModel.exists({ email });

  if (existingUser) {
    throw new AppError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await UserModel.create({ name, email, password: passwordHash });
    res.status(201).json({ token: createToken(user._id.toString()), user: toUserDto(user) });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(409, 'Email already registered');
    }

    throw error;
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginBody;
  const user = await UserModel.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError(401, 'Invalid email or password');
  }

  res.json({ token: createToken(user._id.toString()), user: toUserDto(user) });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  res.json({ user: toUserDto(req.user!) });
}
