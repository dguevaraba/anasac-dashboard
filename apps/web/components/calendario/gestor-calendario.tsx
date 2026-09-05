"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  List,
  MapPin,
  Medal,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  UsersRound,
  Waves,
} from "lucide-react";
import {
  actualizarEventoCalendarioAction,
  crearEventoCalendarioAction,
  eliminarEventoCalendarioAction,
} from "@/app/(live)/(panel)/calendar/actions";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bubbles } from "@/components/ui/bubbles";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/lib/auth/auth-context";
import {
  etiquetaTipoEvento,
  puedeGestionarTipoEvento,
  puedeVerTipoEvento,
  TIPOS_EVENTO_CALENDARIO,
  tiposCreablesParaRol,
  type TipoEventoCalendario,
} from "@/lib/calendario/permisos";
import { cn, formatDateTime } from "@/lib/utils";
import type { Role } from "@/types";

export type CalendarioEvento = {
  id: string;
  title: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  location?: string | null;
  type: TipoEventoCalendario;
};

const TYPE_VARIANT = {
  competencia: "navy",
  entrenamiento: "default",
  reunion: "warning",
  otro: "muted",
} as const;

const TYPE_STYLE = {
  competencia: {
    Icon: Medal,
    chip: "border-[#0f2c3d]/20 bg-[#0f2c3d]/10 text-[#0f2c3d]",
    iconWrap: "bg-[#0f2c3d] text-[var(--anasac-aqua)]",
    card: "border-[#0f2c3d]/25 bg-gradient-to-br from-[#e8eef2] to-white",
    accent: "bg-[#0f2c3d]",
    legend: "bg-[#0f2c3d]",
  },
  entrenamiento: {
    Icon: Waves,
    chip: "border-[var(--anasac-teal)]/25 bg-[var(--anasac-teal)]/10 text-[var(--anasac-teal-dark)]",
    iconWrap: "bg-[var(--anasac-teal)] text-white",
    card: "border-[var(--anasac-teal)]/30 bg-gradient-to-br from-[var(--anasac-teal)]/10 to-white",
    accent: "bg-[var(--anasac-teal)]",
    legend: "bg-[var(--anasac-teal)]",
  },
  reunion: {
    Icon: UsersRound,
    chip: "border-amber-400/40 bg-amber-50 text-amber-900",
    iconWrap: "bg-amber-500 text-white",
    card: "border-amber-300/50 bg-gradient-to-br from-amber-50 to-white",
    accent: "bg-amber-500",
    legend: "bg-amber-500",
  },
  otro: {
    Icon: Sparkles,
    chip: "border-violet-300/50 bg-violet-50 text-violet-900",
    iconWrap: "bg-violet-500 text-white",
    card: "border-violet-300/40 bg-gradient-to-br from-violet-50 to-white",
    accent: "bg-violet-500",
    legend: "bg-violet-500",
  },
} as const;

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

function inicioMes(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function mismoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function claveDia(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function aDatetimeLocalFromDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function aDatetimeLocal(iso: string) {
  return aDatetimeLocalFromDate(new Date(iso));
}

function defaultsNuevoEvento(diaIso: string | null) {
  const base = diaIso ? new Date(`${diaIso}T08:00:00`) : new Date();
  if (!diaIso) {
    base.setMinutes(0, 0, 0);
    if (base.getHours() < 8) base.setHours(8);
  }
  const fin = new Date(base);
  fin.setHours(base.getHours() + 2);
  return {
    start: aDatetimeLocalFromDate(base),
    end: aDatetimeLocalFromDate(fin),
  };
}

function celdasMes(cursor: Date) {
  const first = inicioMes(cursor);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    cells.push(day);
  }
  return cells;
}

function FormularioEvento({
  evento,
  tiposCreables,
  defaults,
  guardando,
  error,
  onCancel,
  onSubmit,
}: {
  evento?: CalendarioEvento | null;
  tiposCreables: TipoEventoCalendario[];
  defaults: { start: string; end: string };
  guardando: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (fd: FormData) => void | Promise<void>;
}) {
  const tipoDefault = evento?.type ?? tiposCreables[0] ?? "entrenamiento";

  return (
    <Card className="mb-4" bubbles bubblePreset="panel">
      <CardContent className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-[var(--anasac-navy)]">
          {evento ? "Editar evento" : "Nuevo evento"}
        </h2>
        <form
          key={evento?.id ?? `nuevo-${defaults.start}`}
          action={onSubmit}
          className="grid gap-3 md:grid-cols-2"
        >
          {evento ? <input type="hidden" name="id" value={evento.id} /> : null}
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={evento?.title ?? ""}
              placeholder="Ej. Entrenamiento matutino"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="type">Tipo</Label>
            <Select id="type" name="type" defaultValue={tipoDefault}>
              {tiposCreables.map((t) => (
                <option key={t} value={t}>
                  {etiquetaTipoEvento(t)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="location">Lugar (opcional)</Label>
            <Input
              id="location"
              name="location"
              defaultValue={evento?.location ?? ""}
              placeholder="Piscina ANASAC"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="startAt">Inicio</Label>
            <Input
              id="startAt"
              name="startAt"
              type="datetime-local"
              required
              defaultValue={
                evento ? aDatetimeLocal(evento.startAt) : defaults.start
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="endAt">Fin</Label>
            <Input
              id="endAt"
              name="endAt"
              type="datetime-local"
              required
              defaultValue={evento ? aDatetimeLocal(evento.endAt) : defaults.end}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              name="description"
              defaultValue={evento?.description ?? ""}
            />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : evento ? "Guardar cambios" : "Guardar evento"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </CardContent>
    </Card>
  );
}

function LeyendaTipos({
  role,
  className,
}: {
  role: Role | null | undefined;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {TIPOS_EVENTO_CALENDARIO.filter((t) => puedeVerTipoEvento(role, t)).map(
        (t) => {
          const { Icon, legend } = TYPE_STYLE[t];
          return (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--anasac-border)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--anasac-navy)]"
            >
              <span
                className={cn(
                  "inline-flex h-5 w-5 items-center justify-center rounded-full text-white",
                  legend,
                )}
              >
                <Icon className="h-3 w-3" />
              </span>
              {etiquetaTipoEvento(t)}
            </span>
          );
        },
      )}
    </div>
  );
}

export function GestorCalendario({
  eventos,
  diaInicial = null,
}: {
  eventos: CalendarioEvento[];
  diaInicial?: string | null;
}) {
  const { user } = useAuth();
  const role = user?.role ?? null;
  const tiposCreables = tiposCreablesParaRol(role);
  const puedeCrearAlgo = tiposCreables.length > 0;

  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const diaValido = useMemo(() => {
    if (!diaInicial || !/^\d{4}-\d{2}-\d{2}$/.test(diaInicial)) return null;
    const [y, m, d] = diaInicial.split("-").map(Number);
    const parsed = new Date(y, m - 1, d);
    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.getFullYear() !== y ||
      parsed.getMonth() !== m - 1 ||
      parsed.getDate() !== d
    ) {
      return null;
    }
    return diaInicial;
  }, [diaInicial]);

  const [vista, setVista] = useState<"mes" | "lista">("mes");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [cursor, setCursor] = useState(() => {
    if (diaValido) {
      const [y, m] = diaValido.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    return inicioMes(new Date());
  });
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(
    () => diaValido,
  );
  const [modoForm, setModoForm] = useState<"crear" | "editar" | null>(null);
  const [eventoEditando, setEventoEditando] = useState<CalendarioEvento | null>(
    null,
  );
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

  const defaultsForm = useMemo(
    () => defaultsNuevoEvento(diaSeleccionado),
    [diaSeleccionado, modoForm],
  );

  const visibles = useMemo(
    () =>
      eventos.filter(
        (e) =>
          puedeVerTipoEvento(role, e.type) &&
          TIPOS_EVENTO_CALENDARIO.includes(e.type),
      ),
    [eventos, role],
  );

  const filtrados = useMemo(
    () =>
      [...visibles]
        .filter((e) => filtroTipo === "todos" || e.type === filtroTipo)
        .sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [visibles, filtroTipo],
  );

  const porDia = useMemo(() => {
    const map = new Map<string, CalendarioEvento[]>();
    for (const e of filtrados) {
      const start = new Date(e.startAt);
      const end = new Date(e.endAt);
      const day = new Date(start);
      day.setHours(0, 0, 0, 0);
      const last = new Date(end);
      last.setHours(0, 0, 0, 0);
      while (day <= last) {
        const key = claveDia(day);
        const list = map.get(key) ?? [];
        list.push(e);
        map.set(key, list);
        day.setDate(day.getDate() + 1);
      }
    }
    return map;
  }, [filtrados]);

  const celdas = useMemo(() => celdasMes(cursor), [cursor]);
  const mesActual = cursor.getMonth();
  const etiquetaMes = `${MESES[mesActual]} ${cursor.getFullYear()}`;
  const eventosDia = diaSeleccionado
    ? (porDia.get(diaSeleccionado) ?? [])
    : [];

  function abrirCrear() {
    setEventoEditando(null);
    setErrorFormulario(null);
    setModoForm("crear");
  }

  function abrirEditar(evento: CalendarioEvento) {
    setEventoEditando(evento);
    setErrorFormulario(null);
    setModoForm("editar");
  }

  function cerrarForm() {
    setModoForm(null);
    setEventoEditando(null);
    setErrorFormulario(null);
  }

  async function alGuardar(formData: FormData) {
    setGuardando(true);
    setErrorFormulario(null);
    const resultado =
      modoForm === "editar"
        ? await actualizarEventoCalendarioAction(formData)
        : await crearEventoCalendarioAction(formData);
    setGuardando(false);
    if (!resultado.ok) {
      setErrorFormulario(resultado.error ?? "No se pudo guardar.");
      return;
    }
    cerrarForm();
  }

  async function alEliminar(evento: CalendarioEvento) {
    if (!confirm(`¿Eliminar «${evento.title}»?`)) return;
    const fd = new FormData();
    fd.set("id", evento.id);
    const resultado = await eliminarEventoCalendarioAction(fd);
    if (!resultado.ok) {
      alert(resultado.error ?? "No se pudo eliminar.");
    }
  }

  function AccionesEvento({ evento }: { evento: CalendarioEvento }) {
    if (!puedeGestionarTipoEvento(role, evento.type)) return null;
    return (
      <div className="mt-2 flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => abrirEditar(evento)}
          aria-label="Editar"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-600"
          onClick={() => void alEliminar(evento)}
          aria-label="Eliminar"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div>
      {modoForm && tiposCreables.length > 0 ? (
        <FormularioEvento
          evento={modoForm === "editar" ? eventoEditando : null}
          tiposCreables={tiposCreables}
          defaults={defaultsForm}
          guardando={guardando}
          error={errorFormulario}
          onCancel={cerrarForm}
          onSubmit={alGuardar}
        />
      ) : null}

      {visibles.length === 0 && !modoForm ? (
        <div className="mb-4 flex justify-end">
          {puedeCrearAlgo ? (
            <Button type="button" onClick={abrirCrear}>
              <Plus className="h-4 w-4" />
              Nuevo evento
            </Button>
          ) : null}
        </div>
      ) : null}

      {visibles.length === 0 && !modoForm ? (
        <EmptyState
          title="El calendario está vacío"
          description={
            puedeCrearAlgo
              ? "Usá «Nuevo evento» para agendar el primero."
              : "Todavía no hay eventos visibles para tu rol."
          }
        />
      ) : null}

      {visibles.length > 0 || modoForm ? (
        <>
          <Card className="mb-4" bubbles bubblePreset="card">
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1">
                    <Label>Vista</Label>
                    <div className="flex gap-1 rounded-lg border border-[var(--anasac-border)] bg-white p-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={vista === "mes" ? "default" : "ghost"}
                        onClick={() => setVista("mes")}
                      >
                        <CalendarDays className="h-4 w-4" />
                        Mes
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={vista === "lista" ? "default" : "ghost"}
                        onClick={() => setVista("lista")}
                      >
                        <List className="h-4 w-4" />
                        Lista
                      </Button>
                    </div>
                  </div>
                  <div className="min-w-[180px] space-y-1">
                    <Label htmlFor="tipoEvento">Tipo</Label>
                    <Select
                      id="tipoEvento"
                      className="w-full sm:w-52"
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                      <option value="todos">Todos los tipos</option>
                      {TIPOS_EVENTO_CALENDARIO.filter((t) =>
                        puedeVerTipoEvento(role, t),
                      ).map((t) => (
                        <option key={t} value={t}>
                          {etiquetaTipoEvento(t)}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {vista === "mes" ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setCursor(
                            new Date(
                              cursor.getFullYear(),
                              cursor.getMonth() - 1,
                              1,
                            ),
                          );
                          setDiaSeleccionado(null);
                        }}
                        aria-label="Mes anterior"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <p className="min-w-[148px] text-center font-[family-name:var(--font-display)] text-base font-bold text-[var(--anasac-navy)] sm:text-lg">
                        {etiquetaMes}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setCursor(
                            new Date(
                              cursor.getFullYear(),
                              cursor.getMonth() + 1,
                              1,
                            ),
                          );
                          setDiaSeleccionado(null);
                        }}
                        aria-label="Mes siguiente"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCursor(inicioMes(hoy));
                          setDiaSeleccionado(claveDia(hoy));
                        }}
                      >
                        Hoy
                      </Button>
                    </>
                  ) : null}
                  {puedeCrearAlgo ? (
                    <Button type="button" onClick={abrirCrear}>
                      <Plus className="h-4 w-4" />
                      Nuevo evento
                    </Button>
                  ) : null}
                </div>
              </div>

              <LeyendaTipos role={role} />
            </CardContent>
          </Card>

          {vista === "mes" ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <Card bubbles bubblePreset="panel">
                <CardContent className="p-3 md:p-4">
                  <div className="mb-2 grid grid-cols-7 gap-1">
                    {DIAS.map((d) => (
                      <div
                        key={d}
                        className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400"
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 md:gap-1.5">
                    {celdas.map((day) => {
                      const key = claveDia(day);
                      const delMes = day.getMonth() === mesActual;
                      const esHoy = mismoDia(day, hoy);
                      const seleccionado = diaSeleccionado === key;
                      const delDia = porDia.get(key) ?? [];
                      const chips = delDia.slice(0, 3);
                      const resto = delDia.length - chips.length;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setDiaSeleccionado(key)}
                          className={cn(
                            "flex min-h-[88px] flex-col rounded-xl border p-1.5 text-left transition md:min-h-[110px] md:p-2",
                            delMes
                              ? "border-[var(--anasac-border)] bg-white"
                              : "border-transparent bg-[var(--anasac-mist)]/40 text-slate-400",
                            esHoy && "ring-2 ring-[var(--anasac-teal)] ring-offset-1",
                            seleccionado &&
                              "border-[var(--anasac-teal)] bg-[var(--anasac-mist)]/70",
                            "hover:border-[var(--anasac-teal)]",
                          )}
                        >
                          <span
                            className={cn(
                              "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                              esHoy
                                ? "bg-[var(--anasac-teal)] text-white"
                                : "text-[var(--anasac-navy)]",
                              !delMes && "text-slate-400",
                            )}
                          >
                            {day.getDate()}
                          </span>
                          <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
                            {chips.map((e) => {
                              const style = TYPE_STYLE[e.type];
                              const Icon = style.Icon;
                              return (
                                <span
                                  key={`${key}-${e.id}`}
                                  className={cn(
                                    "flex items-center gap-0.5 truncate rounded-md border px-1 py-0.5 text-[10px] font-semibold md:text-[11px]",
                                    style.chip,
                                  )}
                                  title={e.title}
                                >
                                  <Icon className="h-2.5 w-2.5 shrink-0" />
                                  <span className="truncate">{e.title}</span>
                                </span>
                              );
                            })}
                            {resto > 0 ? (
                              <span className="px-1 text-[10px] font-medium text-[var(--anasac-teal)]">
                                +{resto} más
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card bubbles bubblePreset="card" className="h-fit lg:sticky lg:top-4">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {diaSeleccionado
                      ? new Date(`${diaSeleccionado}T12:00:00`).toLocaleDateString(
                          "es-CR",
                          { weekday: "long", day: "numeric", month: "long" },
                        )
                      : "Seleccioná un día"}
                  </p>
                  {diaSeleccionado && eventosDia.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">
                      Sin eventos este día.
                    </p>
                  ) : null}
                  <div className="mt-3 space-y-3">
                    {eventosDia.map((event) => {
                      const style = TYPE_STYLE[event.type];
                      const Icon = style.Icon;
                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "relative overflow-hidden rounded-xl border p-3",
                            style.card,
                          )}
                        >
                          <span
                            className={cn(
                              "absolute left-0 top-0 h-full w-1",
                              style.accent,
                            )}
                          />
                          <div className="flex items-start gap-2 pl-1">
                            <span
                              className={cn(
                                "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                style.iconWrap,
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-[var(--anasac-navy)]">
                                  {event.title}
                                </p>
                                <Badge variant={TYPE_VARIANT[event.type]}>
                                  {etiquetaTipoEvento(event.type)}
                                </Badge>
                              </div>
                              <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                                <Clock3 className="h-3 w-3 shrink-0 text-[var(--anasac-teal)]" />
                                {formatDateTime(event.startAt)} —{" "}
                                {formatDateTime(event.endAt)}
                              </p>
                              {event.location ? (
                                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                                  <MapPin className="h-3 w-3 shrink-0 text-amber-600" />
                                  {event.location}
                                </p>
                              ) : null}
                              {event.description ? (
                                <p className="mt-2 text-sm text-slate-600">
                                  {event.description}
                                </p>
                              ) : null}
                              <AccionesEvento evento={event} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-3">
              {filtrados.length === 0 ? (
                <EmptyState
                  title="Sin eventos"
                  description="No hay eventos con ese filtro."
                />
              ) : (
                filtrados.map((event) => {
                  const style = TYPE_STYLE[event.type];
                  const Icon = style.Icon;
                  return (
                  <Card key={event.id} bubbles bubblePreset="panel">
                    <CardContent
                      className={cn(
                        "flex flex-col gap-3 border-l-4 p-5 sm:flex-row sm:items-center sm:justify-between",
                        event.type === "competencia" && "border-l-[#0f2c3d]",
                        event.type === "entrenamiento" &&
                          "border-l-[var(--anasac-teal)]",
                        event.type === "reunion" && "border-l-amber-500",
                        event.type === "otro" && "border-l-violet-500",
                      )}
                    >
                      <div className="flex min-w-0 flex-1 gap-3">
                        <span
                          className={cn(
                            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm",
                            style.iconWrap,
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[var(--anasac-navy)]">
                            {event.title}
                          </h3>
                          <Badge variant={TYPE_VARIANT[event.type]}>
                            {etiquetaTipoEvento(event.type)}
                          </Badge>
                        </div>
                        {event.description ? (
                          <p className="mt-1 text-sm text-slate-500">
                            {event.description}
                          </p>
                        ) : null}
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                          <Clock3 className="h-3.5 w-3.5 text-[var(--anasac-teal)]" />
                          {formatDateTime(event.startAt)} —{" "}
                          {formatDateTime(event.endAt)}
                        </p>
                        {event.location ? (
                          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                            <MapPin className="h-3.5 w-3.5 text-amber-600" />
                            {event.location}
                          </p>
                        ) : null}
                        <AccionesEvento evento={event} />
                        </div>
                      </div>
                      <div
                        className={cn(
                          "relative overflow-hidden rounded-xl px-4 py-3 text-center text-white",
                          style.accent,
                        )}
                      >
                        <Bubbles preset="card" className="opacity-30" />
                        <div className="relative z-[1]">
                          <p className="text-xs uppercase tracking-wide text-white/80">
                            Inicio
                          </p>
                          <p className="font-[family-name:var(--font-display)] text-lg font-bold">
                            {new Date(event.startAt).toLocaleDateString("es-CR", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
