import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getMemorySession,
  hydrateSession,
  login as loginSession,
  logout as logoutSession,
  subscribeSession,
} from "@/lib/auth/session";
import type { Session } from "@/lib/auth/tokens";

type AuthContextValue = {
  session: Session | null;
  isHydrating: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(getMemorySession());
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeSession(setSession);
    hydrateSession().finally(() => setIsHydrating(false));
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await loginSession(email, password);
  }, []);

  const logout = useCallback(async () => {
    await logoutSession();
  }, []);

  const value = useMemo(
    () => ({
      session,
      isHydrating,
      isAuthenticated: Boolean(session),
      login,
      logout,
    }),
    [session, isHydrating, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
