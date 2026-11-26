import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import MovieCard from '../components/MovieCard';
import MovieGrid from '../components/MovieGrid';
import { getLibrary, removeFromLibrary } from '../services/api';
import type { LibraryMovie } from '../types';
import { pickErrorMessage } from '../utils/errors';

const REMOVE_ERRORS: Record<number, string> = {
  0: 'Não foi possível conectar ao servidor.',
  404: 'Filme não encontrado na sua biblioteca.',
};

export default function Library() {
  const [movies, setMovies] = useState<LibraryMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');

    getLibrary()
      .then(({ movies: result }) => {
        if (active) {
          setMovies(result);
        }
      })
      .catch(() => {
        if (active) {
          setError('Não foi possível carregar sua biblioteca.');
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
  }, [reloadKey]);

  async function handleRemove(id: string): Promise<void> {
    setPendingId(id);
    setActionError('');

    try {
      await removeFromLibrary(id);
      setMovies((current) => current.filter((movie) => movie.id !== id));
    } catch (requestError) {
      setActionError(
        pickErrorMessage(requestError, REMOVE_ERRORS, 'Não foi possível remover o filme.'),
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Minha Biblioteca</h1>
        <p className="mt-1 text-sm text-slate-400">Filmes que você já assistiu.</p>
      </header>

      {actionError ? (
        <p
          role="alert"
          className="mb-4 rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300"
        >
          {actionError}
        </p>
      ) : null}

      {isLoading ? <LoadingState message="Carregando sua biblioteca..." /> : null}

      {!isLoading && error ? (
        <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : null}

      {!isLoading && !error && movies.length === 0 ? (
        <EmptyState
          title="Sua biblioteca está vazia"
          description="Adicione filmes na página inicial para montar sua lista de filmes assistidos."
          action={
            <Link
              to="/"
              className="inline-block rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Explorar filmes
            </Link>
          }
        />
      ) : null}

      {!isLoading && !error && movies.length > 0 ? (
        <MovieGrid>
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              action={
                <button
                  type="button"
                  onClick={() => void handleRemove(movie.id)}
                  disabled={pendingId === movie.id}
                  className="w-full rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-950/70 disabled:cursor-wait disabled:opacity-60"
                >
                  {pendingId === movie.id ? 'Removendo...' : 'Remover'}
                </button>
              }
            />
          ))}
        </MovieGrid>
      ) : null}
    </section>
  );
}
