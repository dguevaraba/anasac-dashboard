import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState, type AppStateStatus } from "react-native";
import {
  getPermissionsForRole,
  hasPermission,
  type Permission,
  type Role,
  type UserProfile,
} from "@anasac/shared";
import type { Session } from "@supabase/supabase-js";
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
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
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
  const oauthInFlight = useRef(false);
  const profileRequest = useRef(0);

  const syncProfileFromSession = useCallback(async (session: Session | null) => {
    const requestId = ++profileRequest.current;

    if (!session?.user) {
      if (requestId === profileRequest.current) {
        setUser(null);
        setIsLoading(false);
      }
      return;
    }

    try {
      const profile = await fetchProfileById(getSupabase(), session.user.id);
      if (requestId !== profileRequest.current) return;

      if (!profile || !profile.isActive) {
        await getSupabase().auth.signOut();
        setUser(null);
        setIsLoading(false);
        return;
      }

      setUser(profile);
      setIsLoading(false);
    } catch {
      if (requestId === profileRequest.current) {
        setUser(null);
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const supabase = getSupabase();
    let mounted = true;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      void syncProfileFromSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Evita deadlock de auth-js en RN al tocar storage dentro del callback.
      setTimeout(() => {
        if (!mounted) return;

        if (event === "SIGNED_OUT") {
          void syncProfileFromSession(null);
          return;
        }

        // No borrar usuario en eventos nulos espurios (causa el “doble login”).
        if (!session) return;

        void syncProfileFromSession(session);
      }, 0);
    });

    const onAppState = (state: AppStateStatus) => {
      if (state === "active") {
        void supabase.auth.startAutoRefresh();
        void supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) void syncProfileFromSession(session);
        });
      } else {
        void supabase.auth.stopAutoRefresh();
      }
    };
    const appSub = AppState.addEventListener("change", onAppState);

    const unsubscribeLinks = subscribeAuthDeepLinks((url) => {
      if (!isAuthCallbackUrl(url)) return;
      if (oauthInFlight.current) return;
      void (async () => {
        try {
          const session = await createSessionFromUrl(url);
          if (session) await syncProfileFromSession(session);
        } catch {
          // ignore
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      appSub.remove();
      unsubscribeLinks();
    };
  }, [syncProfileFromSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!isSupabaseConfigured()) {
        return {
          ok: false,
          error: "Falta configurar la conexión con el servidor.",
        };
      }

      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        });
        if (error || !data.session?.user) {
          const detail = error?.message?.trim();
          return {
            ok: false,
            error:
              detail && detail.toLowerCase() !== "invalid login credentials"
                ? detail
                : "Correo o contraseña incorrectos.",
          };
        }

        const result = await resolveProfileAfterAuth(data.session.user.id);
        if (!result.ok) return result;

        setUser(result.profile);
        setIsLoading(false);
        return { ok: true };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : "No se pudo iniciar sesión.",
        };
      }
    },
    [],
  );

  const finishOAuth = useCallback(
    async (provider: "google" | "azure") => {
      if (!isSupabaseConfigured()) {
        return {
          ok: false,
          error: "Falta configurar la conexión con el servidor.",
        };
      }
      oauthInFlight.current = true;
      try {
        const result = await signInWithOAuthProvider(provider);
        if (!result.ok) return { ok: false, error: result.error };
        if (result.profile) {
          setUser(result.profile);
          setIsLoading(false);
        }
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
      } finally {
        oauthInFlight.current = false;
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
    setIsLoading(false);
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
