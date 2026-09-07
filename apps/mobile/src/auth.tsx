import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getPermissionsForRole,
  hasPermission,
  type Permission,
  type Role,
  type UserProfile,
} from "@anasac/shared";
import { isSupabaseConfigured } from "@/supabase/config";
import { getSupabase } from "@/supabase/client";
import { fetchProfileById } from "@/supabase/profile";
import {
  createSessionFromUrl,
  isAuthCallbackUrl,
  resolveProfileAfterAuth,
  signInWithOAuthProvider,
  subscribeAuthDeepLinks,
} from "@/supabase/oauth";

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  loginWithMicrosoft: () => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  can: (permission: Permission) => boolean;
  permissions: Permission[];
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const profile = await fetchProfileById(supabase, authUser.id);
      if (!profile || !profile.isActive) {
        await supabase.auth.signOut();
        setUser(null);
        setIsLoading(false);
        return;
      }

      setUser(profile);
      setIsLoading(false);
    } catch {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
    if (!isSupabaseConfigured()) return;

    const supabase = getSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      void loadProfile();
    });

    const unsubscribeLinks = subscribeAuthDeepLinks((url) => {
      if (!isAuthCallbackUrl(url)) return;
      void (async () => {
        try {
          await createSessionFromUrl(url);
          const result = await resolveProfileAfterAuth();
          if (result.ok) setUser(result.profile);
          else setUser(null);
        } catch {
          // ignore malformed deep links
        }
      })();
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeLinks();
    };
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { ok: false, error: "Falta configurar la conexión con el servidor." };
    }

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        return { ok: false, error: "Correo o contraseña incorrectos." };
      }

      const result = await resolveProfileAfterAuth();
      if (!result.ok) return result;
      setUser(result.profile);
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "No se pudo iniciar sesión.",
      };
    }
  }, []);

  const finishOAuth = useCallback(
    async (provider: "google" | "azure") => {
      if (!isSupabaseConfigured()) {
        return { ok: false, error: "Falta configurar la conexión con el servidor." };
      }
      try {
        const result = await signInWithOAuthProvider(provider);
        if (!result.ok) return { ok: false, error: result.error };
        if (result.profile) setUser(result.profile);
        return { ok: true };
      } catch (e) {
        return {
          ok: false,
          error:
            e instanceof Error
              ? e.message
              : provider === "google"
                ? "No se pudo conectar con Google."
                : "No se pudo conectar con Microsoft.",
        };
      }
    },
    [],
  );

  const loginWithGoogle = useCallback(
    () => finishOAuth("google"),
    [finishOAuth],
  );

  const loginWithMicrosoft = useCallback(
    () => finishOAuth("azure"),
    [finishOAuth],
  );

  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      try {
        await getSupabase().auth.signOut();
      } catch {
        // ignore
      }
    }
    setUser(null);
  }, []);

  const permissions = useMemo(
    () => (user ? getPermissionsForRole(user.role) : []),
    [user],
  );

  const can = useCallback(
    (permission: Permission) =>
      user ? hasPermission(user.role, permission) : false,
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      loginWithGoogle,
      loginWithMicrosoft,
      logout,
      can,
      permissions,
    }),
    [
      user,
      isLoading,
      login,
      loginWithGoogle,
      loginWithMicrosoft,
      logout,
      can,
      permissions,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

export type { Role };
