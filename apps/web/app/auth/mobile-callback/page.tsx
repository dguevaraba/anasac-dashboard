import { Suspense } from "react";
import MobileAuthCallbackPage from "./page-client";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[var(--anasac-navy)] text-white">
          Volviendo a la app…
        </main>
      }
    >
      <MobileAuthCallbackPage />
    </Suspense>
  );
}
