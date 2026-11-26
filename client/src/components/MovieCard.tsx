import type { ReactNode } from 'react';
import type { Movie } from '../types';
import { formatRating, formatReleaseDate } from '../utils/format';

type MovieCardProps = {
  movie: Pick<Movie, 'title' | 'overview' | 'posterUrl' | 'releaseDate' | 'rating'>;
  action?: ReactNode;
};

export default function MovieCard({ movie, action }: MovieCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg shadow-slate-950/40">
      <div className="aspect-[2/3] w-full bg-slate-800">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={`Pôster de ${movie.title}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center text-sm text-slate-500">
            Sem imagem disponível
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-semibold leading-snug text-slate-100">{movie.title}</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>{formatReleaseDate(movie.releaseDate)}</span>
          <span aria-hidden="true">•</span>
          <span className="font-medium text-amber-400">★ {formatRating(movie.rating)}</span>
        </div>
        <p className="line-clamp-3 text-sm text-slate-400">
          {movie.overview || 'Sinopse não disponível.'}
        </p>
        {action ? <div className="mt-auto pt-2">{action}</div> : null}
      </div>
    </article>
  );
}
