export function getSupabaseUrl() {
  return process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

export function getSupabaseAnonKey() {
  return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

/** Origen HTTPS del callback móvil (prod = dashboard). */
export function getAuthRedirectOrigin() {
  return (
    process.env.EXPO_PUBLIC_AUTH_REDIRECT_ORIGIN?.trim().replace(/\/$/, "") ||
    "https://dashboard.anasaccr.com"
  );
}
