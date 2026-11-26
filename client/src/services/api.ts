import type { LibraryMovie, Movie, User } from '../types';

const TOKEN_KEY = 'cinescope.token';
const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

export class ApiError extends Error {
  readonly status: number;
  readonly errors: string[];

  constructor(status: number, message: string, errors: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
}

type RequestOptions = {
  method?: string;
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { accept: 'application/json' };
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/api${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, 'Network error');
  }

  if (response.status === 401 && token) {
    setToken(null);
    unauthorizedHandler?.();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => null)) as {
    message?: string;
    errors?: string[];
  } | null;

  if (!response.ok) {
    throw new ApiError(response.status, payload?.message ?? 'Request failed', payload?.errors ?? []);
  }

  return payload as T;
}

export function register(input: { name: string; email: string; password: string }): Promise<{
  token: string;
  user: User;
}> {
  return request('/auth/register', { method: 'POST', body: input });
}

export function login(input: { email: string; password: string }): Promise<{
  token: string;
  user: User;
}> {
  return request('/auth/login', { method: 'POST', body: input });
}

export function getMe(): Promise<{ user: User }> {
  return request('/auth/me');
}

export function getTrending(): Promise<{ movies: Movie[] }> {
  return request('/movies/trending');
}

export function searchMovies(query: string): Promise<{ movies: Movie[] }> {
  return request(`/movies/search?query=${encodeURIComponent(query)}`);
}

export function getLibrary(): Promise<{ movies: LibraryMovie[] }> {
  return request('/library');
}

export function addToLibrary(tmdbId: number): Promise<{ movie: LibraryMovie }> {
  return request('/library', { method: 'POST', body: { tmdbId } });
}

export function removeFromLibrary(id: string): Promise<void> {
  return request(`/library/${id}`, { method: 'DELETE' });
}

export function updateProfile(name: string): Promise<{ user: User }> {
  return request('/users/me', { method: 'PATCH', body: { name } });
}
