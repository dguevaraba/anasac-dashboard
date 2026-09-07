import * as Linking from "expo-linking";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import type { Provider } from "@supabase/supabase-js";
import { getAuthRedirectOrigin } from "@/supabase/config";
import { getSupabase } from "@/supabase/client";
import { fetchProfileById } from "@/supabase/profile";
import type { UserProfile } from "@anasac/shared";

WebBrowser.maybeCompleteAuthSession();

/** Deep link nativo (App Store) o Expo Go. */
export function getNativeAppRedirect() {
  const isExpoGo = Constants.appOwnership === "expo";
  if (isExpoGo) {
    return Linking.createURL("auth/callback");
  }
  return Linking.createURL("auth/callback", { scheme: "anasac" });
}

/**
 * Redirect que Supabase sí acepta en prod: HTTPS del dashboard.
 * Evita caer en /auth/callback del web (que manda al panel).
 */
export function getOAuthRedirectTo() {
  const origin = getAuthRedirectOrigin();
  const appRedirect = encodeURIComponent(getNativeAppRedirect());
  return `${origin}/auth/mobile-callback?app_redirect=${appRedirect}`;
}

export async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) {
    throw new Error(errorCode);
  }
  if (params.error) {
    throw new Error(
      params.error_description?.replace(/\+/g, " ") || params.error,
    );
  }

  const supabase = getSupabase();

  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      params.code,
    );
    if (error) throw error;
    return data.session;
  }

  const access_token = params.access_token;
  const refresh_token = params.refresh_token;
  if (!access_token || !refresh_token) {
    return null;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return data.session;
}

export async function resolveProfileAfterAuth(): Promise<
  | { ok: true; profile: UserProfile }
  | { ok: false; error: string }
> {
  const supabase = getSupabase();
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
      error: "Esta cuenta no tiene acceso. Pedí una invitación.",
    };
  }
  if (!profile.isActive) {
    await supabase.auth.signOut();
    return { ok: false, error: "Tu cuenta está inactiva." };
  }

  return { ok: true, profile };
}

export async function signInWithOAuthProvider(
  provider: Extract<Provider, "google" | "azure">,
): Promise<{ ok: boolean; error?: string; profile?: UserProfile }> {
  const supabase = getSupabase();
  const redirectTo = getOAuthRedirectTo();
  const httpsReturn = `${getAuthRedirectOrigin()}/auth/mobile-callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      ...(provider === "google"
        ? {
            queryParams: {
              access_type: "offline",
              prompt: "select_account",
            },
          }
        : {
            scopes: "email openid profile offline_access",
          }),
    },
  });

  if (error || !data.url) {
    return {
      ok: false,
      error:
        error?.message ??
        (provider === "google"
          ? "No se pudo conectar con Google."
          : "No se pudo conectar con Microsoft."),
    };
  }

  // Cierra al llegar al callback HTTPS (prod). También acepta deep link.
  const result = await WebBrowser.openAuthSessionAsync(data.url, httpsReturn, {
    preferEphemeralSession: false,
    showInRecents: true,
  });

  if (result.type !== "success" || !("url" in result) || !result.url) {
    // A veces iOS cierra con deep link y type dismiss; la sesión puede llegar por Linking.
    return { ok: false, error: "Inicio de sesión cancelado." };
  }

  try {
    await createSessionFromUrl(result.url);
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : "No se pudo completar el inicio de sesión.",
    };
  }

  return resolveProfileAfterAuth();
}

export function subscribeAuthDeepLinks(
  onUrl: (url: string) => void,
): () => void {
  const sub = Linking.addEventListener("url", ({ url }) => onUrl(url));
  void Linking.getInitialURL().then((url) => {
    if (url) onUrl(url);
  });
  return () => sub.remove();
}

export function isAuthCallbackUrl(url: string) {
  return (
    url.includes("auth/callback") ||
    url.includes("auth/mobile-callback") ||
    url.includes("code=") ||
    url.includes("access_token")
  );
}
