"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/lib/auth/auth-context";
import { competitions as initialCompetitions } from "@/lib/mock/data";
import { formatDate } from "@/lib/utils";
import type { Competition } from "@/types";

const STATUS_VARIANT = {
  programada: "default",
  en_curso: "warning",
  finalizada: "success",
  cancelada: "danger",
} as const;

export default function CompetitionsPage() {
  const { can } = useAuth();
  const canManage = can("competitions:manage");
  const [items, setItems] = useState<Competition[]>(initialCompetitions);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    startDate: "",
    endDate: "",
    poolLength: "25m" as Competition["poolLength"],
    status: "programada" as Competition["status"],
  });

  const filtered = useMemo(
    () =>
      items.filter(
        (c) => statusFilter === "todos" || c.status === statusFilter,
      ),
    [items, statusFilter],
  );

  function addCompetition() {
    if (!canManage) return;
    if (!form.name || !form.location || !form.startDate || !form.endDate) return;
    const now = new Date().toISOString();
    setItems((prev) => [
      {
        id: `comp-${crypto.randomUUID().slice(0, 8)}`,
        ...form,
        createdAt: now,
        updatedAt: now,
      },
      ...prev,
    ]);
    setShowForm(false);
    setForm({
      name: "",
      location: "",
      startDate: "",
      endDate: "",
      poolLength: "25m",
      status: "programada",
    });
  }

  return (
    <div>
      <PageHeader
        title="Competencias"
        description="Calendario competitivo y estado de eventos (mock)."
        actions={
          canManage ? (
            <Button onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4" />
              Nueva competencia
            </Button>
          ) : (
            <Badge variant="muted">Solo lectura</Badge>
          )
        }
      />

      <Card className="mb-4">
        <CardContent className="p-4">
          <Select
            className="md:w-56"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="programada">Programada</option>
            <option value="en_curso">En curso</option>
            <option value="finalizada">Finalizada</option>
            <option value="cancelada">Cancelada</option>
          </Select>
        </CardContent>
      </Card>

      {showForm && canManage ? (
        <Card className="mb-4">
          <CardContent className="grid gap-3 p-4 md:grid-cols-3">
            <div className="space-y-1 md:col-span-2">
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Piscina</Label>
              <Select
                value={form.poolLength}
                onChange={(e) =>
                  setForm({
                    ...form,
                    poolLength: e.target.value as Competition["poolLength"],
                  })
                }
              >
                <option value="25m">25m</option>
                <option value="50m">50m</option>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Lugar</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Estado</Label>
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as Competition["status"],
                  })
                }
              >
                <option value="programada">Programada</option>
                <option value="en_curso">En curso</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Inicio</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Fin</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={addCompetition}>Guardar (mock)</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((comp) => (
          <Card key={comp.id} bubbles bubblePreset="panel">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--anasac-navy)]">
                    {comp.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{comp.location}</p>
                </div>
                <Badge variant={STATUS_VARIANT[comp.status]}>
                  {comp.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Inicio</p>
                  <p className="font-medium">{formatDate(comp.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Fin</p>
                  <p className="font-medium">{formatDate(comp.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Piscina</p>
                  <p className="font-medium">{comp.poolLength}</p>
                </div>
              </div>
              {comp.description ? (
                <p className="mt-3 text-sm text-slate-600">{comp.description}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-center text-sm text-slate-500">
          No hay competencias con ese filtro.
        </p>
      ) : null}
    </div>
  );
}
