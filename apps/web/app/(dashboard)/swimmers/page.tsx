"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth/auth-context";
import {
  categories,
  coaches,
  findCategory,
  findCoach,
  findTeam,
  swimmers as initialSwimmers,
  teams,
} from "@/lib/mock/data";
import { formatDate, getAge } from "@/lib/utils";
import type { Swimmer } from "@/types";

const STATUS_VARIANT = {
  activo: "success",
  inactivo: "muted",
  lesionado: "warning",
} as const;

export default function SwimmersPage() {
  const { can } = useAuth();
  const canManage = can("swimmers:manage");
  const [items, setItems] = useState<Swimmer[]>(initialSwimmers);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "femenino" as Swimmer["gender"],
    categoryId: categories[0].id,
    teamId: teams[0].id,
    coachId: coaches[0].id,
    status: "activo" as Swimmer["status"],
  });

  const filtered = useMemo(() => {
    return items.filter((s) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        (s.documentId?.toLowerCase().includes(q) ?? false);
      const matchesStatus = statusFilter === "todos" || s.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [items, query, statusFilter]);

  function addSwimmer() {
    if (!canManage) return;
    if (!form.firstName || !form.lastName || !form.birthDate) return;
    const now = new Date().toISOString();
    const next: Swimmer = {
      id: `sw-${crypto.randomUUID().slice(0, 8)}`,
      firstName: form.firstName,
      lastName: form.lastName,
      birthDate: form.birthDate,
      gender: form.gender,
      categoryId: form.categoryId,
      teamId: form.teamId,
      coachId: form.coachId,
      status: form.status,
      createdAt: now,
      updatedAt: now,
    };
    setItems((prev) => [next, ...prev]);
    setShowForm(false);
    setForm({
      firstName: "",
      lastName: "",
      birthDate: "",
      gender: "femenino",
      categoryId: categories[0].id,
      teamId: teams[0].id,
      coachId: coaches[0].id,
      status: "activo",
    });
  }

  function toggleStatus(id: string) {
    if (!canManage) return;
    setItems((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: s.status === "activo" ? "inactivo" : "activo",
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
  }

  return (
    <div>
      <PageHeader
        title="Nadadores"
        description="Gestión de atletas afiliados a ANASAC (datos mock)."
        actions={
          canManage ? (
            <Button onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4" />
              Nuevo nadador
            </Button>
          ) : (
            <Badge variant="muted">Solo lectura</Badge>
          )
        }
      />

      <Card className="mb-4" bubbles bubblePreset="card">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Buscar por nombre o cédula..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select
            className="md:w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="lesionado">Lesionado</option>
          </Select>
        </CardContent>
      </Card>

      {showForm && canManage ? (
        <Card className="mb-4">
          <CardContent className="grid gap-3 p-4 md:grid-cols-3">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Apellido</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Fecha de nacimiento</Label>
              <Input
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Género</Label>
              <Select
                value={form.gender}
                onChange={(e) =>
                  setForm({ ...form, gender: e.target.value as Swimmer["gender"] })
                }
              >
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="otro">Otro</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Categoría</Label>
              <Select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Equipo</Label>
              <Select
                value={form.teamId}
                onChange={(e) => setForm({ ...form, teamId: e.target.value })}
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Entrenador</Label>
              <Select
                value={form.coachId}
                onChange={(e) => setForm({ ...form, coachId: e.target.value })}
              >
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end gap-2 md:col-span-2">
              <Button onClick={addSwimmer}>Guardar (mock)</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nadador</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Entrenador</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Alta</TableHead>
                {canManage ? <TableHead>Acciones</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-semibold text-[var(--anasac-navy)]">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">{s.gender}</p>
                  </TableCell>
                  <TableCell>{getAge(s.birthDate)}</TableCell>
                  <TableCell>{findCategory(s.categoryId)?.name}</TableCell>
                  <TableCell>{findTeam(s.teamId)?.name}</TableCell>
                  <TableCell>{findCoach(s.coachId)?.fullName ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[s.status]}>{s.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(s.createdAt)}</TableCell>
                  {canManage ? (
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleStatus(s.id)}
                      >
                        {s.status === "activo" ? "Desactivar" : "Activar"}
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">
              No se encontraron nadadores.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
