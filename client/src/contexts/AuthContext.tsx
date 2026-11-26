import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getMe, getToken, setToken, setUnauthorizedHandler } from '../services/api';
import type { User } from '../types';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setStatus('anonymous');
  }, []);

  const login = useCallback((token: string, nextUser: User) => {
    setToken(token);
    setUser(nextUser);
    setStatus('authenticated');
  }, []);

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus('anonymous');
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession(): Promise<void> {
      if (!getToken()) {
        setStatus('anonymous');
        return;
      }

      try {
        const { user: currentUser } = await getMe();

        if (!active) {
          return;
        }

        setUser(currentUser);
        setStatus('authenticated');
      } catch {
        if (!active) {
          return;
        }

        setToken(null);
        setUser(null);
        setStatus('anonymous');
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({ user, status, login, logout, updateUser }),
    [user, status, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
