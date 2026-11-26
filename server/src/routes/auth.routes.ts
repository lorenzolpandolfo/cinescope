import { Router } from 'express';
import { getMe, login, register } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateLogin, validateRegister } from '../middlewares/validate.middleware.js';

export const authRouter = Router();

authRouter.post('/register', validateRegister, register);
authRouter.post('/login', validateLogin, login);
authRouter.get('/me', requireAuth, getMe);
