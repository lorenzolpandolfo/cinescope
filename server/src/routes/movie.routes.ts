import { Router } from 'express';
import { getTrendingMovies, searchMoviesByTitle } from '../controllers/movie.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import { validateSearchQuery } from '../middlewares/validate.middleware.js';

export const movieRouter = Router();

movieRouter.get('/trending', optionalAuth, getTrendingMovies);
movieRouter.get('/search', optionalAuth, validateSearchQuery, searchMoviesByTitle);
