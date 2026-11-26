export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-slate-400">
        <div>
          <p className="font-semibold text-slate-300">Créditos</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <img
              src="/tmdb-logo.svg"
              alt="The Movie Database (TMDB)"
              className="h-4 w-auto rounded bg-white px-1.5 py-1"
            />
            <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
          </div>
        </div>
        <p>
          Dados e imagens de filmes fornecidos pelo{' '}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 hover:underline"
          >
            The Movie Database (TMDB)
          </a>
          .
        </p>
        <p>CineScope — Atividade Final de Frameworks UniSenac.</p>
      </div>
    </footer>
  );
}
