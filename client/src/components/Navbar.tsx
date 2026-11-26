import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function linkClass({ isActive }: { isActive: boolean }): string {
  return `transition hover:text-amber-300 ${isActive ? 'text-amber-400' : 'text-slate-300'}`;
}

export default function Navbar() {
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout(): void {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-amber-400">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-slate-950">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4" />
            </svg>
          </span>
          CineScope
        </Link>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <NavLink to="/" className={linkClass}>
            Início
          </NavLink>

          {status === 'authenticated' && user ? (
            <>
              <NavLink to="/library" className={linkClass}>
                Minha Biblioteca
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                Perfil
              </NavLink>
              <span className="hidden max-w-40 truncate text-slate-400 sm:inline">{user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-slate-700 px-3 py-1.5 font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Entrar
              </NavLink>
              <Link
                to="/register"
                className="rounded-md bg-amber-500 px-3 py-1.5 font-semibold text-slate-950 transition hover:bg-amber-400"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
