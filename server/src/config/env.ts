const isProduction = process.env.NODE_ENV === 'production';

const tmdbApiKey = process.env.TMDB_API_KEY?.trim() ?? process.env.TMDB_ACCESS_TOKEN?.trim() ?? '';

if (!tmdbApiKey) {
  console.error('Missing required environment variable: TMDB_API_KEY');
  process.exit(1);
}

const jwtSecret = process.env.JWT_SECRET?.trim() || (isProduction ? '' : 'cinescope-local-development-secret');

if (!jwtSecret) {
  console.error('Missing required environment variable: JWT_SECRET');
  process.exit(1);
}

if (isProduction && jwtSecret.length < 32) {
  console.error('JWT_SECRET must have at least 32 characters in production');
  process.exit(1);
}

const parsedPort = Number(process.env.PORT ?? 4000);
const configuredOrigins = (process.env.CLIENT_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction,
  port: Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 4000,
  mongoUri: process.env.MONGODB_URI?.trim() || 'mongodb://127.0.0.1:27017/cinescope',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || '7d',
  tmdbApiKey,
  clientOrigins: configuredOrigins.length > 0 ? configuredOrigins : ['http://localhost:5173'],
};
