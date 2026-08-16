/**
 * Clientes Supabase (preparados para la fase con backend real).
 * En la fase mock no se llaman; las variables pueden estar vacías.
 */

export function getSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    useMock: process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false",
  };
}

export function assertPublicSupabaseConfig() {
  const { url, anonKey, useMock } = getSupabaseEnv();
  if (useMock) return { url, anonKey, useMock };
  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return { url, anonKey, useMock };
}
