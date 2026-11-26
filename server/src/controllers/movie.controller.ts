import type { Request, Response } from 'express';
import { MovieModel } from '../models/movie.model.js';
import { fetchTrendingMovies, searchMovies } from '../services/tmdb.service.js';
import { toMovieDto } from '../utils/mappers.js';

async function findLibraryIds(userId: string | undefined, tmdbIds: number[]): Promise<Set<number>> {
  if (!userId || tmdbIds.length === 0) {
    return new Set();
  }

  const movies = await MovieModel.find({ userId, tmdbId: { $in: tmdbIds } })
    .select('tmdbId')
    .lean();

  return new Set(movies.map((movie) => movie.tmdbId));
}

export async function getTrendingMovies(req: Request, res: Response): Promise<void> {
  const movies = await fetchTrendingMovies();
  const libraryIds = await findLibraryIds(
    req.user?._id.toString(),
    movies.map((movie) => movie.id),
  );

  res.json({
    movies: movies.map((movie) => toMovieDto(movie, libraryIds.has(movie.id))),
  });
}

export async function searchMoviesByTitle(req: Request, res: Response): Promise<void> {
  const query = res.locals.searchQuery as string;
  const movies = await searchMovies(query);
  const libraryIds = await findLibraryIds(
    req.user?._id.toString(),
    movies.map((movie) => movie.id),
  );

  res.json({
    movies: movies.map((movie) => toMovieDto(movie, libraryIds.has(movie.id))),
  });
}
