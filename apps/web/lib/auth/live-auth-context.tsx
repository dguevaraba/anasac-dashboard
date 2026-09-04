"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { AuthContext, type AuthContextValue } from "@/lib/auth/auth-context";
import { fetchProfileById } from "@/lib/auth/profile";
import { getPermissionsForRole, hasPermission } from "@/lib/auth/permissions";
import {
  readViewAsRole,
  subscribeViewAsRole,
  writeViewAsRole,
} from "@/lib/auth/view-as-role";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Permission, Role, UserProfile } from "@/types";

export function LiveAuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const viewAsRole = useSyncExternalStore(
    subscribeViewAsRole,
    readViewAsRole,
    () => null,
  );

  const loadProfile = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const supabase = createBrowserSupabase();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const nextProfile = await fetchProfileById(supabase, authUser.id);
    const onInvite = window.location.pathname.startsWith("/invitar");

    if (!nextProfile && !onInvite) {
      await supabase.auth.signOut();
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setProfile(nextProfile);
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
    setProfile(profile);
    return { ok: true };
  }, []);

  const loginWithGoogle = useCallback(async (next?: string) => {
    if (!isSupabaseConfigured()) {
      return { ok: false, error: "Supabase no está configurado." };
    }
    // Guardar destino en cookie (no en la URL). Si el redirectTo lleva ?next=...,
    // Supabase a veces no lo matchea y cae al Site URL de producción.
    const destination = next || "/dashboard";
    document.cookie = `anasac_oauth_next=${encodeURIComponent(destination)}; path=/; max-age=600; SameSite=Lax`;
    const supabase = createBrowserSupabase();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { access_type: "offline", prompt: "select_account" },
      },
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    writeViewAsRole(null);
    if (isSupabaseConfigured()) {
      const supabase = createBrowserSupabase();
      await supabase.auth.signOut();
    }
    setProfile(null);
  }, []);

  const switchRoleDemo = useCallback((_role: Role) => {
    // Solo aplica en /example
  }, []);

  const realRole = profile?.role ?? null;
  const effectiveRole =
    realRole === "administrador" && viewAsRole && viewAsRole !== "administrador"
      ? viewAsRole
      : realRole;
  const user = profile
    ? { ...profile, role: effectiveRole ?? profile.role }
    : null;

  // Asociados u otros roles no admin: limpiar vista previa residual del navegador.
  useEffect(() => {
    if (!isLoading && realRole && realRole !== "administrador" && viewAsRole) {
      writeViewAsRole(null);
    }
  }, [isLoading, realRole, viewAsRole]);

  const setViewAsRole = useCallback(
    (role: Role | null) => {
      if (realRole !== "administrador") return;
      writeViewAsRole(role);
    },
    [realRole],
  );

  const permissions = useMemo(
    () => (effectiveRole ? getPermissionsForRole(effectiveRole) : []),
    [effectiveRole],
  );

  const can = useCallback(
    (permission: Permission) =>
      effectiveRole ? hasPermission(effectiveRole, permission) : false,
    [effectiveRole],
  );

  const value = useMemo<AuthContextValue>(
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
