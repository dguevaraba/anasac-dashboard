import * as Linking from "expo-linking";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import type { Provider, Session } from "@supabase/supabase-js";
import { getAuthRedirectOrigin } from "@/supabase/config";
import { getSupabase } from "@/supabase/client";
import { fetchProfileById } from "@/supabase/profile";
import type { UserProfile } from "@anasac/shared";

WebBrowser.maybeCompleteAuthSession();

/** Evita canjear el mismo `code` dos veces (deep link + AuthSession). */
const exchangedCodes = new Map<string, Promise<Session | null>>();

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

export async function createSessionFromUrl(url: string): Promise<Session | null> {
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
    const code = params.code;
    const existing = exchangedCodes.get(code);
    if (existing) return existing;

    const exchange = (async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.session) return data.session;

      // Si otro listener ya canjeó el code, la sesión igual puede estar lista.
      const { data: current } = await supabase.auth.getSession();
      if (current.session) return current.session;

      if (error) throw error;
      return null;
    })();

    exchangedCodes.set(code, exchange);
    try {
      return await exchange;
    } catch (e) {
      exchangedCodes.delete(code);
      throw e;
    }
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

export async function resolveProfileAfterAuth(
  userId?: string,
): Promise<
  | { ok: true; profile: UserProfile }
  | { ok: false; error: string }
> {
  const supabase = getSupabase();

  let id = userId;
  if (!id) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    id = session?.user?.id;
  }
  if (!id) {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    id = authUser?.id;
  }

  if (!id) {
    return { ok: false, error: "No se pudo iniciar sesión." };
  }

  const profile = await fetchProfileById(supabase, id);
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

  // Expo Go / Simulator: Safari. Producción: sesión nativa.
  const useSystemBrowser =
    Constants.appOwnership === "expo" || __DEV__;

  const deepLinkPromise = waitForAuthCallbackUrl(useSystemBrowser ? 120_000 : 45_000);

  let callbackUrl: string | null = null;

  if (useSystemBrowser) {
    await WebBrowser.openBrowserAsync(data.url, {
      showInRecents: true,
      enableBarCollapsing: false,
      createTask: false,
    });
    callbackUrl = await deepLinkPromise;
    try {
      WebBrowser.dismissBrowser();
    } catch {
      // ignore
    }
  } else {
    // Cerrar cuando vuelve el deep link nativo (más fiable en iOS que solo HTTPS).
    const nativeReturn = getNativeAppRedirect();
    const result = await WebBrowser.openAuthSessionAsync(data.url, nativeReturn, {
      preferEphemeralSession: false,
      showInRecents: true,
    });
    if (result.type === "success" && "url" in result && result.url) {
      callbackUrl = result.url;
    } else {
      callbackUrl = await deepLinkPromise;
    }
  }

  if (!callbackUrl) {
    // Sesión pudo llegar por el listener global antes de este return.
    const recovered = await resolveProfileAfterAuth();
    if (recovered.ok) return { ok: true, profile: recovered.profile };
    return {
      ok: false,
      error: useSystemBrowser
        ? "No se completó el inicio de sesión. Cerrá Safari y reintentá."
        : "Inicio de sesión cancelado.",
    };
  }

  try {
    const session = await createSessionFromUrl(callbackUrl);
    const result = await resolveProfileAfterAuth(session?.user?.id);
    if (!result.ok) return result;
    return { ok: true, profile: result.profile };
  } catch (e) {
    const recovered = await resolveProfileAfterAuth();
    if (recovered.ok) return { ok: true, profile: recovered.profile };
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : "No se pudo completar el inicio de sesión.",
    };
  }
}

function waitForAuthCallbackUrl(timeoutMs: number): Promise<string | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (url: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      subscription.remove();
      resolve(url);
    };

    const timer = setTimeout(() => finish(null), timeoutMs);
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (isAuthCallbackUrl(url)) finish(url);
    });
  });
}

export function subscribeAuthDeepLinks(
  onUrl: (url: string) => void,
): () => void {
  const sub = Linking.addEventListener("url", ({ url }) => onUrl(url));
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
