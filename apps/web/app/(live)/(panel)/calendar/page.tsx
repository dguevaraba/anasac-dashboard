import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import {
  GestorCalendario,
  type CalendarioEvento,
} from "@/components/calendario/gestor-calendario";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ dia?: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Sin conexión"
        description="Configurá Supabase para ver el calendario real."
      />
    );
  }

  const { dia } = await searchParams;
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("calendar_events")
    .select("id, title, description, start_at, end_at, location, type")
    .order("start_at", { ascending: true });

  const eventos: CalendarioEvento[] = (data ?? [])
    .map((row) => ({
      id: row.id as string,
      title: row.title as string,
      description: (row.description as string | null) ?? null,
      startAt: String(row.start_at),
      endAt: String(row.end_at),
      location: (row.location as string | null) ?? null,
      type: row.type as CalendarioEvento["type"],
    }))
    .filter(
      (e) =>
        e.type === "competencia" ||
        e.type === "entrenamiento" ||
        e.type === "reunion" ||
        e.type === "otro",
    );

  return (
    <div>
      <PageHeader
        title="Calendario"
        description="Eventos, entrenamientos y competencias programadas."
      />
      <GestorCalendario eventos={eventos} diaInicial={dia ?? null} />
    </div>
  );
}
