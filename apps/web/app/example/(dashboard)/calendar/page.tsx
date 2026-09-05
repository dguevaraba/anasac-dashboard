"use client";

import { PageHeader } from "@/components/layout/page-header";
import { GestorCalendario } from "@/components/calendario/gestor-calendario";
import { calendarEvents } from "@/lib/mock/data";
import type { TipoEventoCalendario } from "@/lib/calendario/permisos";

export default function CalendarPage() {
  return (
    <div>
      <PageHeader
        title="Calendario"
        description="Eventos, entrenamientos y competencias programadas."
      />
      <GestorCalendario
        eventos={calendarEvents
          .filter(
            (e) =>
              e.type === "competencia" ||
              e.type === "entrenamiento" ||
              e.type === "reunion" ||
              e.type === "otro",
          )
          .map((e) => ({
            id: e.id,
            title: e.title,
            description: e.description ?? null,
            startAt: e.startAt,
            endAt: e.endAt,
            location: e.location ?? null,
            type: e.type as TipoEventoCalendario,
          }))}
      />
    </div>
  );
}
