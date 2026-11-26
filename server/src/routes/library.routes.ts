import { Router } from 'express';
import {
  addToLibrary,
  listLibrary,
  removeFromLibrary,
} from '../controllers/library.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateLibraryCreate } from '../middlewares/validate.middleware.js';

export const libraryRouter = Router();

libraryRouter.use(requireAuth);
libraryRouter.get('/', listLibrary);
libraryRouter.post('/', validateLibraryCreate, addToLibrary);
libraryRouter.delete('/:id', removeFromLibrary);
