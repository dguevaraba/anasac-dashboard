"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ALL_ROLES, ROLE_LABELS } from "@/lib/auth/permissions";
import { formatDate } from "@/lib/utils";
import type { Role, UserProfile } from "@/types";
import { createInvitationAction, updateUserAction } from "./actions";

type InvitationItem = {
  id: string;
  token: string;
  invited_email: string | null;
  full_name: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  roles: { code: string; name: string } | { code: string; name: string }[] | null;
};

function roleFromJoin(roles: InvitationItem["roles"]) {
  if (!roles) return "nadador";
  const code = Array.isArray(roles) ? roles[0]?.code : roles.code;
  return (code as Role) ?? "nadador";
}

export function UsersManager({
  users,
  invitations,
}: {
  users: UserProfile[];
  invitations: InvitationItem[];
}) {
  const { can, user } = useAuth();
  const canManage = can("users:manage");
  const [copied, setCopied] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const roleCounts = useMemo(() => {
    return users.reduce(
      (acc, u) => {
        acc[u.role] += 1;
        return acc;
      },
      ALL_ROLES.reduce(
        (acc, role) => {
          acc[role] = 0;
          return acc;
        },
        {} as Record<Role, number>,
      ),
    );
  }, [users]);

  const pending = invitations.filter((i) => !i.accepted_at);

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

  async function onCreate(formData: FormData) {
    setSaving(true);
    setFormError(null);
    setCreatedUrl(null);
    const result = await createInvitationAction(formData);
    setSaving(false);
    if (!result.ok) {
      setFormError(result.error ?? "No se pudo crear la invitación.");
      return;
    }
    const url = `${window.location.origin}/invitar/${result.token}`;
    setCreatedUrl(url);
  }

  async function onUpdate(formData: FormData) {
    await updateUserAction(formData);
  }

  async function copyLink(token: string) {
    const url = `${window.location.origin}/invitar/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div>
      <PageHeader
        title="Usuarios y roles"
        description="Generá un enlace y enviaselo a la otra persona. No lo abras vos: si estás logueado, no se aplica a tu cuenta."
        actions={!canManage ? <Badge variant="muted">Solo lectura</Badge> : undefined}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {ALL_ROLES.map((role) => (
          <Card key={role} bubbles bubblePreset="card">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {ROLE_LABELS[role]}
              </p>
              <p className="text-2xl font-bold text-[var(--anasac-navy)]">
                {roleCounts[role]}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {canManage ? (
        <Card className="mb-6" bubbles bubblePreset="panel">
          <CardHeader>
            <CardTitle>Nueva invitación</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={onCreate} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <Label htmlFor="fullName">Nombre (opcional)</Label>
                <Input id="fullName" name="fullName" placeholder="Ej. Ana Mora" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="invitedEmail">Correo de referencia (opcional)</Label>
                <Input
                  id="invitedEmail"
                  name="invitedEmail"
                  type="email"
                  placeholder="Puede usar otro Gmail al entrar"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="role">Rol</Label>
                <Select id="role" name="role" defaultValue="nadador">
                  {ALL_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="days">Vence en (días)</Label>
                <Input id="days" name="days" type="number" min={1} max={60} defaultValue={14} />
              </div>
              <div className="md:col-span-2 lg:col-span-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Generando..." : "Generar enlace de invitación"}
                </Button>
              </div>
            </form>
            {formError ? (
              <p className="mt-3 text-sm text-red-600">{formError}</p>
            ) : null}
            {createdUrl ? (
              <div className="mt-4 rounded-xl border border-[var(--anasac-border)] bg-[var(--anasac-mist)] p-3 text-sm">
                <p className="font-semibold text-[var(--anasac-navy)]">
                  Enlace listo. Enviáselo a la otra persona (no lo abras en este navegador):
                </p>
                <p className="mt-1 break-all font-mono text-xs">{createdUrl}</p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-2"
                  onClick={() => void navigator.clipboard.writeText(createdUrl)}
                >
                  Copiar
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {canManage && pending.length > 0 ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Invitaciones pendientes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead>Enlace</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>
                      {invite.full_name || invite.invited_email || "Sin nombre"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="navy">
                        {ROLE_LABELS[roleFromJoin(invite.roles)] ?? roleFromJoin(invite.roles)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(invite.expires_at)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void copyLink(invite.token)}
                      >
                        {copied === invite.token ? "Copiado" : "Copiar enlace"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
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
                      <form action={onUpdate}>
                        <input type="hidden" name="id" value={u.id} />
                        <input
                          type="hidden"
                          name="isActive"
                          value={u.isActive ? "true" : "false"}
                        />
                        <Select
                          className="h-9 w-44"
                          name="role"
                          defaultValue={u.role}
                          onChange={(e) => {
                            e.currentTarget.form?.requestSubmit();
                          }}
                        >
                          {ALL_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </Select>
                      </form>
                    ) : (
                      <Badge variant="navy">{ROLE_LABELS[u.role]}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {canManage ? (
                      <form action={onUpdate}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="role" value={u.role} />
                        <input
                          type="hidden"
                          name="isActive"
                          value={u.isActive ? "false" : "true"}
                        />
                        <Button size="sm" variant="outline" type="submit">
                          {u.isActive ? "Desactivar" : "Activar"}
                        </Button>
                      </form>
                    ) : (
                      <Badge variant={u.isActive ? "success" : "muted"}>
                        {u.isActive ? "activo" : "inactivo"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(u.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
