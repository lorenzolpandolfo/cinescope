import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/api';
import { pickErrorMessage } from '../utils/errors';

const PROFILE_ERRORS: Record<number, string> = {
  0: 'Não foi possível conectar ao servidor.',
  400: 'Verifique o nome informado.',
};

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFeedback('');
    setError('');

    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setError('O nome deve ter entre 2 e 80 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { user: updatedUser } = await updateProfile(trimmedName);
      updateUser(updatedUser);
      setName(updatedUser.name);
      setFeedback('Nome atualizado com sucesso.');
    } catch (requestError) {
      setError(
        pickErrorMessage(requestError, PROFILE_ERRORS, 'Não foi possível atualizar seu nome.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-bold">Perfil</h1>
        <p className="mt-1 text-sm text-slate-400">Atualize seu nome de exibição.</p>
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

        {feedback ? (
          <p
            role="status"
            className="rounded-md border border-emerald-800/60 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300"
          >
            {feedback}
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
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-300">E-mail</span>
          <input type="email" value={user.email} disabled readOnly className={inputClass} />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>
    </section>
  );
}
