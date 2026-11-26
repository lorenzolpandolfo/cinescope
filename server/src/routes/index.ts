import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { libraryRouter } from './library.routes.js';
import { movieRouter } from './movie.routes.js';
import { userRouter } from './user.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/movies', movieRouter);
apiRouter.use('/library', libraryRouter);
apiRouter.use('/users', userRouter);
