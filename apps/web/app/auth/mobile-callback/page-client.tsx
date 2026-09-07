"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Callback OAuth solo para la app móvil.
 * No intercambia el code ni manda al dashboard web:
 * el code vuelve a la app (ASWebAuthenticationSession / deep link).
 */
export default function MobileAuthCallbackPage() {
  const params = useSearchParams();
  const [triedDeepLink, setTriedDeepLink] = useState(false);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    params.forEach((value, key) => {
      if (key === "app_redirect") return;
      q.set(key, value);
    });
    return q.toString();
  }, [params]);

  useEffect(() => {
    const deepBase =
      params.get("app_redirect")?.trim() || "anasac://auth/callback";
    const deepLink = query ? `${deepBase}?${query}` : deepBase;

    window.location.replace(deepLink);
    setTriedDeepLink(true);
  }, [params, query]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--anasac-navy)] px-6 text-center text-white">
      <div>
        <p className="text-lg font-semibold">Volviendo a la app…</p>
        <p className="mt-2 text-sm text-white/70">
          Si no se cierra sola, volvé a ANASAC manualmente.
        </p>
        {triedDeepLink ? (
          <p className="mt-6 text-xs text-white/50">Deep link enviado</p>
        ) : null}
      </div>
    </main>
  );
}
