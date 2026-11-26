import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import MovieCard from '../components/MovieCard';
import MovieGrid from '../components/MovieGrid';
import { useAuth } from '../contexts/AuthContext';
import { addToLibrary, getTrending, searchMovies } from '../services/api';
import type { Movie } from '../types';
import { pickErrorMessage } from '../utils/errors';

const LIBRARY_ERRORS: Record<number, string> = {
  0: 'Não foi possível conectar ao servidor.',
  404: 'Filme não encontrado.',
  409: 'Este filme já está na sua biblioteca.',
  502: 'Não foi possível carregar os dados do filme.',
};

export default function Home() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingTmdbId, setPendingTmdbId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const term = searchTerm.trim();

    if (!term) {
      setActiveQuery('');
      return;
    }

    const timer = window.setTimeout(() => setActiveQuery(term), 400);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    setActionError('');

    const request = activeQuery ? searchMovies(activeQuery) : getTrending();

    request
      .then(({ movies: result }) => {
        if (active) {
          setMovies(result);
        }
      })
      .catch(() => {
        if (active) {
          setError(
            activeQuery
              ? 'Não foi possível buscar os filmes.'
              : 'Não foi possível carregar os filmes em alta.',
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [activeQuery, reloadKey]);

  async function handleAdd(tmdbId: number): Promise<void> {
    if (status !== 'authenticated') {
      navigate('/login', { state: { from: { pathname: '/' } } });
      return;
    }

    setPendingTmdbId(tmdbId);
    setActionError('');

    try {
      await addToLibrary(tmdbId);
      setMovies((current) =>
        current.map((movie) =>
          movie.tmdbId === tmdbId ? { ...movie, inLibrary: true } : movie,
        ),
      );
    } catch (requestError) {
      setActionError(
        pickErrorMessage(requestError, LIBRARY_ERRORS, 'Não foi possível adicionar o filme.'),
      );
    } finally {
      setPendingTmdbId(null);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {activeQuery ? `Resultados para "${activeQuery}"` : 'Em alta esta semana'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {activeQuery
              ? 'Filmes encontrados no catálogo do TMDB.'
              : 'Descubra os filmes mais populares do momento.'}
          </p>
        </div>

        <div className="w-full sm:w-72">
          <label htmlFor="movie-search" className="sr-only">
            Buscar filmes
          </label>
          <input
            id="movie-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar filmes..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {actionError ? (
        <p
          role="alert"
          className="mb-4 rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300"
        >
          {actionError}
        </p>
      ) : null}

      {isLoading ? <LoadingState message="Carregando filmes..." /> : null}

      {!isLoading && error ? (
        <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : null}

      {!isLoading && !error && movies.length === 0 ? (
        <EmptyState
          title="Nenhum filme encontrado"
          description={
            activeQuery
              ? 'Tente buscar por outro título.'
              : 'Tente novamente em alguns instantes.'
          }
        />
      ) : null}

      {!isLoading && !error && movies.length > 0 ? (
        <MovieGrid>
          {movies.map((movie) => (
            <MovieCard
              key={movie.tmdbId}
              movie={movie}
              action={
                status === 'loading' ? (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-wait rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-500"
                  >
                    Carregando...
                  </button>
                ) : status !== 'authenticated' ? (
                  <Link
                    to="/login"
                    state={{ from: { pathname: '/' } }}
                    className="block w-full rounded-md border border-amber-500/60 px-3 py-2 text-center text-sm font-semibold text-amber-300 transition hover:bg-amber-500/10"
                  >
                    Entrar para salvar
                  </Link>
                ) : movie.inLibrary ? (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-default rounded-md border border-emerald-700 bg-emerald-950/50 px-3 py-2 text-sm font-medium text-emerald-300"
                  >
                    Na biblioteca
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleAdd(movie.tmdbId)}
                    disabled={pendingTmdbId === movie.tmdbId}
                    className="w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60"
                  >
                    {pendingTmdbId === movie.tmdbId
                      ? 'Adicionando...'
                      : 'Adicionar à biblioteca'}
                  </button>
                )
              }
            />
          ))}
        </MovieGrid>
      ) : null}
    </section>
  );
}
