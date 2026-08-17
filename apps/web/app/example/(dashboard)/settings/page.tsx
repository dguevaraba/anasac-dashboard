"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { ROLE_LABELS } from "@/lib/auth/permissions";

export default function SettingsPage() {
  const { user, can } = useAuth();

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Preferencias generales de la aplicación. Supabase se conectará en una fase posterior."
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
              <Badge variant="warning">Mock / demo</Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Autenticación</span>
              <Badge variant="muted">Mock (próximo: Supabase Auth)</Badge>
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
              El sitio público <strong>anasaccr.com</strong> no se modifica.
            </p>
            <p>
              Esta aplicación se desplegará de forma independiente y, más adelante,
              se publicará en <strong>dashboard.anasaccr.com</strong> mediante un
              registro DNS exclusivo del subdominio <code>dashboard</code>.
            </p>
            <p>
              Antes de tocar DNS se documentará exactamente el registro a crear.
              No se alterarán registros A/CNAME/MX del dominio principal.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
