import type { Request, Response } from 'express';
import { UserModel } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';
import { toUserDto } from '../utils/mappers.js';

type ProfileUpdateBody = {
  name: string;
};

export async function updateMe(req: Request, res: Response): Promise<void> {
  const { name } = req.body as ProfileUpdateBody;
  const user = await UserModel.findByIdAndUpdate(
    req.user!._id,
    { name, updatedAt: new Date() },
    { returnDocument: 'after', runValidators: true },
  );

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json({ user: toUserDto(user) });
}
