"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Bubbles } from "@/components/ui/bubbles";
import { Select } from "@/components/ui/select";
import { calendarEvents } from "@/lib/mock/data";
import { formatDateTime } from "@/lib/utils";

const TYPE_VARIANT = {
  competencia: "navy",
  entrenamiento: "default",
  reunion: "warning",
  otro: "muted",
} as const;

export default function CalendarPage() {
  const [typeFilter, setTypeFilter] = useState("todos");

  const events = useMemo(
    () =>
      [...calendarEvents]
        .filter((e) => typeFilter === "todos" || e.type === typeFilter)
        .sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [typeFilter],
  );

  return (
    <div>
      <PageHeader
        title="Calendario"
        description="Eventos, entrenamientos y competencias programadas."
      />

      <Card className="mb-4" bubbles bubblePreset="card">
        <CardContent className="p-4">
          <Select
            className="md:w-56"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="todos">Todos los tipos</option>
            <option value="competencia">Competencia</option>
            <option value="entrenamiento">Entrenamiento</option>
            <option value="reunion">Reunión</option>
            <option value="otro">Otro</option>
          </Select>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {events.map((event) => (
          <Card key={event.id} bubbles bubblePreset="panel">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-[var(--anasac-navy)]">
                    {event.title}
                  </h3>
                  <Badge variant={TYPE_VARIANT[event.type]}>{event.type}</Badge>
                </div>
                {event.description ? (
                  <p className="mt-1 text-sm text-slate-500">{event.description}</p>
                ) : null}
                <p className="mt-2 text-sm text-slate-600">
                  {formatDateTime(event.startAt)} — {formatDateTime(event.endAt)}
                </p>
                {event.location ? (
                  <p className="text-sm text-slate-500">{event.location}</p>
                ) : null}
              </div>
              <div className="relative overflow-hidden rounded-xl bg-[var(--anasac-mist)] px-4 py-3 text-center">
                <Bubbles preset="card" className="opacity-70" />
                <div className="relative z-[1]">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Inicio</p>
                  <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--anasac-teal)]">
                    {new Date(event.startAt).toLocaleDateString("es-CR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
