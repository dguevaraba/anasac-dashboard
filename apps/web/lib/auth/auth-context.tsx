"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { DEMO_PASSWORD, demoUsers } from "@/lib/mock/data";
import { getPermissionsForRole, hasPermission } from "@/lib/auth/permissions";
import type { Permission, Role, UserProfile } from "@/types";

const SESSION_KEY = "anasac_mock_session";
const COOKIE_NAME = "anasac_session";
const AUTH_EVENT = "anasac-auth-change";

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  switchRoleDemo: (role: Role) => void;
  can: (permission: Permission) => boolean;
  permissions: Permission[];
}

const AuthContext = createContext<AuthContextValue | null>(null);

function setSessionCookie(userId: string | null) {
  if (typeof document === "undefined") return;
  if (userId) {
    document.cookie = `${COOKIE_NAME}=${userId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
}

function readSession(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    return demoUsers.find((u) => u.id === parsed.id) ?? parsed;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(AUTH_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(AUTH_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function persistUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setSessionCookie(user.id);
  } else {
    localStorage.removeItem(SESSION_KEY);
    setSessionCookie(null);
  }
  notifyAuthChange();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribe, readSession, () => null);
  const isLoading = false;

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const found = demoUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.isActive,
    );
    if (!found || password !== DEMO_PASSWORD) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }
    persistUser(found);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    persistUser(null);
  }, []);

  const switchRoleDemo = useCallback((role: Role) => {
    const match = demoUsers.find((u) => u.role === role);
    if (!match) return;
    persistUser(match);
  }, []);

  const permissions = useMemo(
    () => (user ? getPermissionsForRole(user.role) : []),
    [user],
  );

  const can = useCallback(
    (permission: Permission) => (user ? hasPermission(user.role, permission) : false),
    [user],
  );

  const value = useMemo(
    () => ({ user, isLoading, login, logout, switchRoleDemo, can, permissions }),
    [user, isLoading, login, logout, switchRoleDemo, can, permissions],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
