import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <p className="text-5xl" aria-hidden="true">
        🎬
      </p>
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p className="text-sm text-slate-400">
        O endereço acessado não existe ou foi movido.
      </p>
      <Link
        to="/"
        className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
      >
        Voltar para o início
      </Link>
    </section>
  );
}
