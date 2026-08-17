"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { useAppConfig } from "@/lib/app-config";
import { ROLE_LABELS } from "@/lib/auth/permissions";

export default function SettingsPage() {
  const { user, can } = useAuth();
  const { demo } = useAppConfig();

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
                {user?.fullName} · {user ? ROLE_LABELS[user.role] : ""}
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
            <CardTitle>Dominio e infraestructura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>
              Esta aplicación vive en <strong>dashboard.anasaccr.com</strong>.
              El sitio público <strong>anasaccr.com</strong> no se modifica.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
