export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type Movie = {
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string | null;
  posterUrl: string | null;
  releaseDate: string;
  rating: number;
  inLibrary: boolean;
};

export type LibraryMovie = {
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
