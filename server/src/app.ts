import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { apiRouter } from './routes/index.js';

function resolveCorsOrigin(origins: string[]): string | (string | RegExp)[] {
  if (origins.includes('*')) {
    return '*';
  }

  return origins.map((origin) => {
    if (!origin.includes('*')) {
      return origin;
    }

    const escaped = origin.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`);
  });
}

export const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: resolveCorsOrigin(env.clientOrigins) }));
app.use(express.json({ limit: '10kb' }));
app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
