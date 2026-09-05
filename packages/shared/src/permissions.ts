import type { Permission, Role } from "./types";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  administrador: [
    "dashboard:view",
    "swimmers:view",
    "swimmers:manage",
    "coaches:view",
    "coaches:manage",
    "competitions:view",
    "competitions:manage",
    "calendar:view",
    "calendar:manage",
    "results:view",
    "results:manage",
    "payments:view",
    "payments:manage",
    "users:view",
    "users:manage",
    "settings:view",
    "settings:manage",
  ],
  entrenador: [
    "dashboard:view",
    "swimmers:view",
    "coaches:view",
    "competitions:view",
    "competitions:manage",
    "calendar:view",
    "calendar:manage",
    "results:view",
    "results:manage",
    "settings:view",
  ],
  nadador: [
    "dashboard:view",
    "competitions:view",
    "calendar:view",
    "results:view",
    "settings:view",
  ],
  asociado: [
    "dashboard:view",
    "swimmers:view",
    "coaches:view",
    "competitions:view",
    "calendar:view",
    "calendar:manage",
    "results:view",
    "settings:view",
  ],
  contador: [
    "dashboard:view",
    "swimmers:view",
    "swimmers:manage",
    "payments:view",
    "payments:manage",
    "settings:view",
  ],
};

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canManage(
  role: Role,
  resource:
    | "swimmers"
    | "coaches"
    | "competitions"
    | "calendar"
    | "results"
    | "payments"
    | "users"
    | "settings",
) {
  return hasPermission(role, `${resource}:manage` as Permission);
}

export const ROLE_LABELS: Record<Role, string> = {
  administrador: "Administrador",
  entrenador: "Entrenador",
  nadador: "Nadador",
  asociado: "Asociado",
  contador: "Contador",
};

export const ALL_ROLES = Object.keys(ROLE_LABELS) as Role[];
