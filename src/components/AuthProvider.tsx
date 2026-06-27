"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getSession,
  logout as authLogout,
} from "@/lib/auth";
import type { Session, UserRole } from "@/lib/types";

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isUpravnik: boolean;
  isDezurni: boolean;
  isStaff: boolean;
  isStanar: boolean;
  isGost: boolean;
  isResident: boolean;
  /** @deprecated Koristiti isUpravnik */
  isAdmin: boolean;
  role: UserRole | null;
  refreshSession: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(() => {
    setSession(getSession());
  }, []);

  useEffect(() => {
    refreshSession();
    setIsLoading(false);
  }, [refreshSession]);

  const logout = useCallback(() => {
    authLogout();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      isAuthenticated: session !== null,
      isUpravnik: session?.role === "upravnik",
      isDezurni: session?.role === "dezurni",
      isStaff: session?.role === "upravnik" || session?.role === "dezurni",
      isStanar: session?.role === "stanar",
      isGost: session?.role === "gost",
      isResident: session?.role === "stanar" || session?.role === "gost",
      isAdmin: session?.role === "upravnik",
      role: session?.role ?? null,
      refreshSession,
      logout,
    }),
    [session, isLoading, refreshSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth mora biti unutar AuthProvider");
  }
  return ctx;
}
