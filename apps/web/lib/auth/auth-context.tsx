"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { DEMO_PASSWORD, demoUsers } from "@/lib/mock/data";
import { getPermissionsForRole, hasPermission } from "@/lib/auth/permissions";
import {
  readViewAsRole,
  subscribeViewAsRole,
  writeViewAsRole,
} from "@/lib/auth/view-as-role";
import type { Permission, Role, UserProfile } from "@/types";

const SESSION_KEY = "anasac_mock_session";
const COOKIE_NAME = "anasac_session";
const AUTH_EVENT = "anasac-auth-change";

export interface AuthContextValue {
  user: UserProfile | null;
  realRole: Role | null;
  viewAsRole: Role | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogle: (next?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void | Promise<void>;
  switchRoleDemo: (role: Role) => void;
  setViewAsRole: (role: Role | null) => void;
  can: (permission: Permission) => boolean;
  permissions: Permission[];
}

export const AuthContext = createContext<AuthContextValue | null>(null);

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

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const storedUser = useSyncExternalStore(subscribe, readSession, () => null);
  const viewAsRole = useSyncExternalStore(
    subscribeViewAsRole,
    readViewAsRole,
    () => null,
  );
  const isLoading = false;
  const realRole = storedUser?.role ?? null;
  const effectiveRole =
    realRole === "administrador" && viewAsRole && viewAsRole !== "administrador"
      ? viewAsRole
      : realRole;
  const user = storedUser
    ? { ...storedUser, role: effectiveRole ?? storedUser.role }
    : null;

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

  const loginWithGoogle = useCallback(async () => {
    return { ok: false, error: "Google no está disponible en el modo demo." };
  }, []);

  const logout = useCallback(() => {
    writeViewAsRole(null);
    persistUser(null);
  }, []);

  const switchRoleDemo = useCallback((role: Role) => {
    const match = demoUsers.find((u) => u.role === role);
    if (!match) return;
    writeViewAsRole(null);
    persistUser(match);
  }, []);

  const setViewAsRole = useCallback(
    (role: Role | null) => {
      if (realRole !== "administrador") return;
      writeViewAsRole(role);
    },
    [realRole],
  );

  // Roles que no son admin no deben conservar vista previa en el navegador.
  useEffect(() => {
    if (realRole && realRole !== "administrador" && viewAsRole) {
      writeViewAsRole(null);
    }
  }, [realRole, viewAsRole]);

  const permissions = useMemo(
    () => (effectiveRole ? getPermissionsForRole(effectiveRole) : []),
    [effectiveRole],
  );

  const can = useCallback(
    (permission: Permission) =>
      effectiveRole ? hasPermission(effectiveRole, permission) : false,
    [effectiveRole],
  );

  const value = useMemo(
    () => ({
      user,
      realRole,
      viewAsRole: effectiveRole !== realRole ? viewAsRole : null,
      isLoading,
      login,
      loginWithGoogle,
      logout,
      switchRoleDemo,
      setViewAsRole,
      can,
      permissions,
    }),
    [
      user,
      realRole,
      viewAsRole,
      effectiveRole,
      isLoading,
      login,
      loginWithGoogle,
      logout,
      switchRoleDemo,
      setViewAsRole,
      can,
      permissions,
    ],
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
