import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export type TmdbMovie = {
  id: number;
  title?: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
  vote_average?: number;
  adult?: boolean;
};

type TmdbListResponse = {
  results?: TmdbMovie[];
};

function usesBearerToken(): boolean {
  return env.tmdbApiKey.startsWith('eyJ');
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${path}`);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const headers: Record<string, string> = { accept: 'application/json' };

  if (usesBearerToken()) {
    headers.Authorization = `Bearer ${env.tmdbApiKey}`;
  } else {
    url.searchParams.set('api_key', env.tmdbApiKey);
  }

  let response: Response;

  try {
    response = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
  } catch {
    throw new AppError(502, 'Failed to load movies from TMDB');
  }

  if (!response.ok) {
    console.error(`TMDB request failed with status ${response.status} on ${path}`);

    if (response.status === 404) {
      throw new AppError(404, 'Movie not found on TMDB');
    }

    throw new AppError(502, 'Failed to load movies from TMDB');
  }

  return (await response.json()) as T;
}

function normalizeMovie(movie: TmdbMovie | null | undefined): TmdbMovie | null {
  if (!movie || movie.adult === true) {
    return null;
  }

  if (!Number.isInteger(movie.id) || movie.id <= 0) {
    return null;
  }

  if (typeof movie.title !== 'string' || movie.title.trim().length === 0) {
    return null;
  }

  return movie;
}

function normalizeResults(response: TmdbListResponse): TmdbMovie[] {
  const results = response.results ?? [];
  const movies: TmdbMovie[] = [];

  for (const result of results) {
    const movie = normalizeMovie(result);

    if (movie) {
      movies.push(movie);
    }

    if (movies.length === 20) {
      break;
    }
  }

  return movies;
}

export async function fetchTrendingMovies(): Promise<TmdbMovie[]> {
  const response = await tmdbFetch<TmdbListResponse>('/trending/movie/week', {
    language: 'pt-BR',
  });

  return normalizeResults(response);
}

export async function searchMovies(query: string): Promise<TmdbMovie[]> {
  const response = await tmdbFetch<TmdbListResponse>('/search/movie', {
    query,
    language: 'pt-BR',
    page: '1',
    include_adult: 'false',
  });

  return normalizeResults(response);
}

export async function fetchMovieDetails(tmdbId: number): Promise<TmdbMovie> {
  const response = await tmdbFetch<TmdbMovie>(`/movie/${tmdbId}`, {
    language: 'pt-BR',
  });

  const movie = normalizeMovie(response);

  if (!movie) {
    throw new AppError(404, 'Movie not found on TMDB');
  }

  return movie;
}
