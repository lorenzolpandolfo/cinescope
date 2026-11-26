import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MovieModel } from '../models/movie.model.js';
import { fetchMovieDetails } from '../services/tmdb.service.js';
import { AppError } from '../utils/AppError.js';
import { isDuplicateKeyError } from '../utils/duplicateKey.js';
import { toLibraryMovieDto } from '../utils/mappers.js';

type LibraryCreateBody = {
  tmdbId: number;
};

export async function listLibrary(req: Request, res: Response): Promise<void> {
  const movies = await MovieModel.find({ userId: req.user!._id }).sort({ createdAt: -1 });
  res.json({ movies: movies.map(toLibraryMovieDto) });
}

export async function addToLibrary(req: Request, res: Response): Promise<void> {
  const { tmdbId } = req.body as LibraryCreateBody;
  const userId = req.user!._id;
  const existingMovie = await MovieModel.exists({ userId, tmdbId });

  if (existingMovie) {
    throw new AppError(409, 'Movie already in library');
  }

  const details = await fetchMovieDetails(tmdbId);
  const title = details.title?.trim();

  if (!title) {
    throw new AppError(404, 'Movie not found on TMDB');
  }

  const posterPath =
    typeof details.poster_path === 'string' && details.poster_path.trim().length > 0
      ? details.poster_path.trim()
      : null;

  try {
    const movie = await MovieModel.create({
      userId,
      tmdbId: details.id,
      title,
      overview: details.overview?.trim() ?? '',
      posterPath,
      releaseDate: details.release_date?.trim() ?? '',
      rating: Math.min(10, Math.max(0, details.vote_average ?? 0)),
    });

    res.status(201).json({ movie: toLibraryMovieDto(movie) });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(409, 'Movie already in library');
    }

    throw error;
  }
}

export async function removeFromLibrary(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, 'Invalid movie id');
  }

  const movie = await MovieModel.findOneAndDelete({ _id: id, userId: req.user!._id });

  if (!movie) {
    throw new AppError(404, 'Movie not found');
  }

  res.status(204).send();
}
