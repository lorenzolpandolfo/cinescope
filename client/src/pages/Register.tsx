import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import { useAuth } from '../contexts/AuthContext';
import { register as registerRequest } from '../services/api';
import { pickErrorMessage } from '../utils/errors';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REGISTER_ERRORS: Record<number, string> = {
  0: 'Não foi possível conectar ao servidor.',
  400: 'Verifique os dados informados.',
  409: 'Este e-mail já está cadastrado.',
};

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none';

export default function Register() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === 'loading') {
    return <LoadingState message="Carregando..." />;
  }

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setError('Informe seu nome.');
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError('Informe um e-mail válido.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerRequest({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });
      login(response.token, response.user);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(
        pickErrorMessage(requestError, REGISTER_ERRORS, 'Não foi possível criar sua conta.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-bold">Criar conta</h1>
        <p className="mt-1 text-sm text-slate-400">
          Cadastre-se para salvar os filmes que você já assistiu.
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
          <span className="font-medium text-slate-300">Nome</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            className={inputClass}
            placeholder="Seu nome"
          />
        </label>

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
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            className={inputClass}
            placeholder="Mínimo de 8 caracteres"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </button>

        <p className="text-center text-sm text-slate-400">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-amber-400 hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </section>
  );
}
