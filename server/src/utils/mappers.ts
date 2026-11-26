import type { MovieDocument } from '../models/movie.model.js';
import type { UserDocument } from '../models/user.model.js';
import type { TmdbMovie } from '../services/tmdb.service.js';

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export type UserDto = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type MovieDto = {
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string | null;
  posterUrl: string | null;
  releaseDate: string;
  rating: number;
  inLibrary: boolean;
};

export type LibraryMovieDto = {
  id: string;
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string | null;
  posterUrl: string | null;
  releaseDate: string;
  rating: number;
  createdAt: string;
};

function buildPosterUrl(posterPath: string | null): string | null {
  return posterPath ? `${POSTER_BASE_URL}${posterPath}` : null;
}

function normalizePosterPath(posterPath: string | null | undefined): string | null {
  if (typeof posterPath !== 'string') {
    return null;
  }
  const trimmed = posterPath.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toUserDto(user: UserDocument): UserDto {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toMovieDto(movie: TmdbMovie, inLibrary: boolean): MovieDto {
  const posterPath = normalizePosterPath(movie.poster_path);

  return {
    tmdbId: movie.id,
    title: movie.title?.trim() ?? '',
    overview: movie.overview?.trim() ?? '',
    posterPath,
    posterUrl: buildPosterUrl(posterPath),
    releaseDate: movie.release_date?.trim() ?? '',
    rating: typeof movie.vote_average === 'number' ? movie.vote_average : 0,
    inLibrary,
  };
}

export function toLibraryMovieDto(movie: MovieDocument): LibraryMovieDto {
  return {
    id: movie._id.toString(),
    tmdbId: movie.tmdbId,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.posterPath,
    posterUrl: buildPosterUrl(movie.posterPath),
    releaseDate: movie.releaseDate,
    rating: movie.rating,
    createdAt: movie.createdAt.toISOString(),
  };
}
