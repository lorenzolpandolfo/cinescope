import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import { useAuth } from '../contexts/AuthContext';
import { login as loginRequest } from '../services/api';
import { pickErrorMessage } from '../utils/errors';

const LOGIN_ERRORS: Record<number, string> = {
  0: 'Não foi possível conectar ao servidor.',
  400: 'Informe um e-mail e uma senha válidos.',
  401: 'E-mail ou senha inválidos.',
};

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none';

export default function Login() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === 'loading') {
    return <LoadingState message="Carregando..." />;
  }

  if (status === 'authenticated') {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await loginRequest({ email: email.trim(), password });
      login(response.token, response.user);
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(
        pickErrorMessage(requestError, LOGIN_ERRORS, 'Não foi possível entrar. Tente novamente.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="mt-1 text-sm text-slate-400">
          Acesse sua conta para montar sua biblioteca pessoal.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6"
      >
        {error ? (
          <p
            role="alert"
            className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300"
          >
            {error}
          </p>
        ) : null}

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-300">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className={inputClass}
            placeholder="voce@exemplo.com"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-300">Senha</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className={inputClass}
            placeholder="Sua senha"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="text-center text-sm text-slate-400">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-amber-400 hover:underline">
            Criar conta
          </Link>
        </p>
      </form>
    </section>
  );
}
