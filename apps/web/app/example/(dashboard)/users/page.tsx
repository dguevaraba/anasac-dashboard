"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { demoUsers as initialUsers } from "@/lib/mock/data";
import { formatDate } from "@/lib/utils";
import type { Role, UserProfile } from "@/types";

export default function UsersPage() {
  const { can, switchRoleDemo, user } = useAuth();
  const router = useRouter();
  const canManage = can("users:manage");
  const [items, setItems] = useState<UserProfile[]>(initialUsers);

  const roleCounts = useMemo(() => {
    return items.reduce(
      (acc, u) => {
        acc[u.role] += 1;
        return acc;
      },
      { administrador: 0, entrenador: 0, consulta: 0 } as Record<Role, number>,
    );
  }, [items]);

  if (!can("users:view")) {
    return (
      <div>
        <PageHeader
          title="Usuarios"
          description="No tienes permiso para ver esta sección."
        />
      </div>
    );
  }

  function updateRole(id: string, role: Role) {
    if (!canManage) return;
    setItems((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, role, updatedAt: new Date().toISOString() }
          : u,
      ),
    );
  }

  function toggleActive(id: string) {
    if (!canManage) return;
    setItems((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, isActive: !u.isActive, updatedAt: new Date().toISOString() }
          : u,
      ),
    );
  }

  return (
    <div>
      <PageHeader
        title="Usuarios y roles"
        description="Administración de accesos. En demo puedes cambiar de rol para probar permisos."
        actions={!canManage ? <Badge variant="muted">Solo lectura</Badge> : undefined}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {(Object.keys(roleCounts) as Role[]).map((role) => (
          <Card key={role} bubbles bubblePreset="card">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {ROLE_LABELS[role]}
                </p>
                <p className="text-2xl font-bold text-[var(--anasac-navy)]">
                  {roleCounts[role]}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  switchRoleDemo(role);
                  router.refresh();
                }}
              >
                Probar rol
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Actualizado</TableHead>
                {canManage ? <TableHead>Acciones</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <p className="font-semibold text-[var(--anasac-navy)]">
                      {u.fullName}
                      {u.id === user?.id ? (
                        <span className="ml-2 text-xs font-normal text-[var(--anasac-teal)]">
                          (tú)
                        </span>
                      ) : null}
                    </p>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {canManage ? (
                      <Select
                        className="h-9 w-44"
                        value={u.role}
                        onChange={(e) =>
                          updateRole(u.id, e.target.value as Role)
                        }
                      >
                        <option value="administrador">Administrador</option>
                        <option value="entrenador">Entrenador</option>
                        <option value="consulta">Consulta</option>
                      </Select>
                    ) : (
                      <Badge variant="navy">{ROLE_LABELS[u.role]}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? "success" : "muted"}>
                      {u.isActive ? "activo" : "inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(u.updatedAt)}</TableCell>
                  {canManage ? (
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActive(u.id)}
                      >
                        {u.isActive ? "Desactivar" : "Activar"}
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
