import { Schema, Types, model, type HydratedDocument } from 'mongoose';

export type Movie = {
  userId: Types.ObjectId;
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseDate: string;
  rating: number;
  createdAt: Date;
};

export type MovieDocument = HydratedDocument<Movie>;

const movieSchema = new Schema<Movie>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tmdbId: {
    type: Number,
    required: true,
    min: 1,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },
  overview: {
    type: String,
    default: '',
  },
  posterPath: {
    type: String,
    default: null,
  },
  releaseDate: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

movieSchema.index({ userId: 1, tmdbId: 1 }, { unique: true });

export const MovieModel = model<Movie>('Movie', movieSchema);
