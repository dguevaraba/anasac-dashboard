"use client";

import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppConfig } from "@/lib/app-config";
import { useAuth } from "@/lib/auth/auth-context";
import { useSignOut } from "@/lib/auth/use-sign-out";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user, permissions } = useAuth();
  const { demo } = useAppConfig();
  const { signOut, pending } = useSignOut();

  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Mi perfil"
        description={
          demo
            ? "Información de la cuenta activa en modo demostración."
            : "Información de tu cuenta."
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1" bubbles bubblePreset="avatar">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="relative">
              <span className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-[var(--anasac-teal-soft)]" />
              <span className="absolute -bottom-1 -left-3 h-5 w-5 rounded-full bg-[var(--anasac-aqua)]/30" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[var(--anasac-teal)] text-2xl font-bold text-white">
                {user.fullName
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </div>
            </div>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--anasac-navy)]">
              {user.fullName}
            </h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <Badge className="mt-3" variant="navy">
              {ROLE_LABELS[user.role]}
            </Badge>
            <Button
              type="button"
              variant="outline"
              className="mt-5 w-full text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={pending}
              onClick={() => void signOut()}
            >
              <LogOut className="h-4 w-4" />
              {pending ? "Saliendo..." : "Cerrar sesión"}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2" bubbles bubblePreset="panel">
          <CardHeader>
            <CardTitle>Detalles</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Teléfono</p>
              <p className="font-medium">{user.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Estado</p>
              <p className="font-medium">{user.isActive ? "Activo" : "Inactivo"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Creado</p>
              <p className="font-medium">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Actualizado</p>
              <p className="font-medium">{formatDate(user.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3" bubbles bubblePreset="header">
          <CardHeader>
            <CardTitle>Permisos del rol actual</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {permissions.map((p) => (
              <Badge key={p} variant="default">
                {p}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
