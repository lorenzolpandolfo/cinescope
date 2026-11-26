import { Router } from 'express';
import { updateMe } from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateNameUpdate } from '../middlewares/validate.middleware.js';

export const userRouter = Router();

userRouter.patch('/me', requireAuth, validateNameUpdate, updateMe);
