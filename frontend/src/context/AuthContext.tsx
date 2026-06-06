import { createContext, useContext, useEffect, useState } from 'react';
import { auth, ApiError } from '../api';
import type { User } from '../api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (name: string, password: string) => Promise<void>;
  register: (name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.me()
      .then(setUser)
      .catch((err) => {
        // 401 just means no active session — not an error worth logging
        if (!(err instanceof ApiError && err.status === 401)) console.error(err);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(name: string, password: string) {
    const u = await auth.login(name, password);
    setUser(u);
  }

  async function register(name: string, password: string) {
    const u = await auth.register(name, password);
    setUser(u);
  }

  async function logout() {
    await auth.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
