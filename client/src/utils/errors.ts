import { ApiError } from '../services/api';

export function pickErrorMessage(
  error: unknown,
  messages: Record<number, string>,
  fallback: string,
): string {
  if (error instanceof ApiError) {
    return messages[error.status] ?? fallback;
  }

  return fallback;
}
