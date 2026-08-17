import { Suspense } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { InviteClient } from "./invite-client";

type Preview = {
  ok: boolean;
  error?: string;
  full_name?: string | null;
  role_name?: string;
  accepted?: boolean;
  expired?: boolean;
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <Message
        title="Falta configuración"
        body="El panel todavía no tiene conectado Supabase."
      />
    );
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("preview_invitation", {
    invite_token: token,
  });

  const preview = (data ?? { ok: false, error: error?.message }) as Preview;

  if (!preview.ok) {
    return (
      <Message
        title="Invitación no válida"
        body={preview.error ?? "Este enlace no existe o ya no sirve."}
      />
    );
  }

  if (preview.accepted) {
    return (
      <Message
        title="Invitación ya utilizada"
        body="Este enlace ya fue aceptado. Entrá desde la pantalla de inicio de sesión."
      />
    );
  }

  if (preview.expired) {
    return (
      <Message
        title="Invitación vencida"
        body="Pedile al administrador que genere un enlace nuevo."
      />
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--anasac-navy)] text-white">
          Cargando invitación...
        </div>
      }
    >
      <InviteClient
        token={token}
        roleName={preview.role_name ?? "usuario"}
        fullName={preview.full_name ?? null}
      />
    </Suspense>
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--anasac-navy)] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--anasac-navy)]">
          {title}
        </h1>
        <p className="mt-3 text-sm text-slate-500">{body}</p>
      </div>
    </div>
  );
}
