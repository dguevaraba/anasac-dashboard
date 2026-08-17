"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthContextValue } from "@/lib/auth/auth-context";
import { fetchProfileById } from "@/lib/auth/profile";
import { getPermissionsForRole, hasPermission } from "@/lib/auth/permissions";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Permission, Role, UserProfile } from "@/types";

export function LiveAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const supabase = createBrowserSupabase();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const profile = await fetchProfileById(supabase, authUser.id);
    const onInvite = window.location.pathname.startsWith("/invitar");

    if (!profile && !onInvite) {
      await supabase.auth.signOut();
      setUser(null);
      setIsLoading(false);
      return;
    }

    setUser(profile);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadProfile();
    if (!isSupabaseConfigured()) return;

    const supabase = createBrowserSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadProfile();
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { ok: false, error: "Supabase no está configurado." };
    }
    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      return { ok: false, error: "No se pudo iniciar sesión." };
    }
    const profile = await fetchProfileById(supabase, authUser.id);
    if (!profile) {
      await supabase.auth.signOut();
      return {
        ok: false,
        error: "Esta cuenta de Google no tiene acceso.",
      };
    }
    if (!profile.isActive) {
      await supabase.auth.signOut();
      return { ok: false, error: "Tu cuenta está inactiva." };
    }
    setUser(profile);
    return { ok: true };
  }, []);

  const loginWithGoogle = useCallback(async (next?: string) => {
    if (!isSupabaseConfigured()) {
      return { ok: false, error: "Supabase no está configurado." };
    }
    const supabase = createBrowserSupabase();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", next || "/dashboard");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo.toString(),
        queryParams: { access_type: "offline", prompt: "select_account" },
      },
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const supabase = createBrowserSupabase();
      await supabase.auth.signOut();
    }
    setUser(null);
  }, []);

  const switchRoleDemo = useCallback((_role: Role) => {
    // Solo aplica en /example
  }, []);

  const permissions = useMemo(
    () => (user ? getPermissionsForRole(user.role) : []),
    [user],
  );

  const can = useCallback(
    (permission: Permission) => (user ? hasPermission(user.role, permission) : false),
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login,
      loginWithGoogle,
      logout,
      switchRoleDemo,
      can,
      permissions,
    }),
    [user, isLoading, login, loginWithGoogle, logout, switchRoleDemo, can, permissions],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
