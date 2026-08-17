import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Bubbles } from "@/components/ui/bubbles";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPE_VARIANT = {
  competencia: "navy",
  entrenamiento: "default",
  reunion: "warning",
  otro: "muted",
} as const;

export default async function CalendarPage() {
  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Sin conexión"
        description="Configurá Supabase para ver el calendario real."
      />
    );
  }

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("calendar_events")
    .select("id, title, description, start_at, end_at, location, type")
    .order("start_at", { ascending: true });

  const rows = data ?? [];

  return (
    <div>
      <PageHeader
        title="Calendario"
        description="Eventos, entrenamientos y competencias programadas."
      />
      {rows.length === 0 ? (
        <EmptyState
          title="El calendario está vacío"
          description="Cuando se agenden entrenamientos o competencias, van a aparecer acá."
        />
      ) : (
        <div className="space-y-3">
          {rows.map((event) => (
            <Card key={event.id} bubbles bubblePreset="card">
              <CardContent className="relative overflow-hidden p-4">
                <Bubbles preset="card" className="opacity-50" />
                <div className="relative z-[1] flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[var(--anasac-navy)]">{event.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDateTime(event.start_at)}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant={
                      TYPE_VARIANT[event.type as keyof typeof TYPE_VARIANT] ?? "muted"
                    }
                  >
                    {event.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
