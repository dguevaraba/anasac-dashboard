import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEMO_PASSWORD,
  demoUsers,
  getPermissionsForRole,
  hasPermission,
  type Permission,
  type Role,
  type UserProfile,
} from "@anasac/shared";

const SESSION_KEY = "anasac_mobile_session";

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRoleDemo: (role: Role) => Promise<void>;
  can: (permission: Permission) => boolean;
  permissions: Permission[];
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as UserProfile;
        const fresh = demoUsers.find((u) => u.id === parsed.id) ?? parsed;
        setUser(fresh);
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback(async (next: UserProfile | null) => {
    if (next) {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
    setUser(next);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      await new Promise((r) => setTimeout(r, 350));
      const found = demoUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.isActive,
      );
      if (!found || password !== DEMO_PASSWORD) {
        return { ok: false, error: "Correo o contraseña incorrectos." };
      }
      await persist(found);
      return { ok: true };
    },
    [persist],
  );

  const logout = useCallback(async () => {
    await persist(null);
  }, [persist]);

  const switchRoleDemo = useCallback(
    async (role: Role) => {
      const match = demoUsers.find((u) => u.role === role);
      if (match) await persist(match);
    },
    [persist],
  );

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
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
