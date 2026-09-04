"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth/auth-context";
import { useAppConfig } from "@/lib/app-config";
import { ALL_ROLES, ROLE_LABELS, getPermissionsForRole } from "@/lib/auth/permissions";
import type { Role } from "@/types";

export default function SettingsPage() {
  const { user, can, realRole, viewAsRole, setViewAsRole } = useAuth();
  const { demo } = useAppConfig();
  // Usar siempre el rol real: si el admin simula asociado, sigue viendo esta sección.
  const puedeVistaPreviaRol = realRole === "administrador";
  const previewOn = Boolean(viewAsRole);
  const [selectedRole, setSelectedRole] = useState<Role>(viewAsRole ?? "contador");
  const activePreviewRole = viewAsRole ?? selectedRole;
  const previewPermissions = getPermissionsForRole(activePreviewRole);

  return (
    <div>
      <PageHeader
        title="Configuración"
        description={
          demo
            ? "Preferencias generales de la aplicación (modo demostración)."
            : "Preferencias generales de la aplicación."
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {puedeVistaPreviaRol ? (
          <Card className="lg:col-span-2" bubbles bubblePreset="panel">
            <CardHeader>
              <CardTitle>Vista previa de rol</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--anasac-navy)]">
                    Ver la app como otro rol
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Solo cambia menús y botones. Tu cuenta sigue siendo administrador
                    (aunque simules asociado u otro rol) y la base de datos no se
                    modifica.
                  </p>
                </div>
                <Switch
                  label="Activar vista previa de rol"
                  checked={previewOn}
                  onCheckedChange={(checked) => {
                    setViewAsRole(checked ? selectedRole : null);
                  }}
                />
              </div>

              <div className="max-w-xs space-y-1">
                <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="view-as-role">
                  Rol a simular
                </label>
                <Select
                  id="view-as-role"
                  value={activePreviewRole}
                  onChange={(event) => {
                    const role = event.target.value as Role;
                    setSelectedRole(role);
                    if (previewOn) setViewAsRole(role);
                  }}
                >
                  {ALL_ROLES.filter((role) => role !== "administrador").map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
                  Accesos de {ROLE_LABELS[activePreviewRole]}
                </p>
                <div className="flex flex-wrap gap-2">
                  {previewPermissions.map((permission) => (
                    <Badge key={permission} variant="default">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card bubbles bubblePreset="panel">
          <CardHeader>
            <CardTitle>Organización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-3 border-b border-[var(--anasac-border)] pb-2">
              <span className="text-slate-500">Nombre</span>
              <span className="font-medium text-[var(--anasac-navy)]">
                Asociación de Natación de Santa Cruz
              </span>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--anasac-border)] pb-2">
              <span className="text-slate-500">Siglas</span>
              <span className="font-medium">ANASAC</span>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--anasac-border)] pb-2">
              <span className="text-slate-500">País</span>
              <span className="font-medium">Costa Rica</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Sitio público</span>
              <a
                href="https://anasaccr.com"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--anasac-teal)] hover:underline"
              >
                anasaccr.com
              </a>
            </div>
          </CardContent>
        </Card>

        <Card bubbles bubblePreset="card">
          <CardHeader>
            <CardTitle>Entorno actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Modo de datos</span>
              <Badge variant={demo ? "warning" : "success"}>
                {demo ? "Mock / demo" : "Supabase"}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Autenticación</span>
              <Badge variant={demo ? "muted" : "success"}>
                {demo ? "Mock" : "Google / invitación"}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Usuario activo</span>
              <span className="font-medium">
                {user?.fullName} · {realRole ? ROLE_LABELS[realRole] : ""}
                {viewAsRole ? ` (vista ${ROLE_LABELS[viewAsRole]})` : ""}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Puede gestionar usuarios</span>
              <Badge variant={can("users:manage") ? "success" : "muted"}>
                {can("users:manage") ? "Sí" : "No"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2" bubbles bubblePreset="header">
          <CardHeader>
            <CardTitle>Contacto ANASAC</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Correo</p>
              <a
                href="mailto:info@anasaccr.com"
                className="font-medium text-[var(--anasac-teal)] hover:underline"
              >
                info@anasaccr.com
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Teléfono</p>
              <a
                href="tel:+50683706170"
                className="font-medium text-[var(--anasac-navy)]"
              >
                +506 8370 6170
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Sede</p>
              <p className="font-medium text-[var(--anasac-navy)]">
                Santa Cruz, Guanacaste
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
