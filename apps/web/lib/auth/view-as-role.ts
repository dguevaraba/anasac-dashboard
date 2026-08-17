import { ALL_ROLES, ROLE_LABELS } from "@/lib/auth/permissions";
import type { Role } from "@/types";

export const VIEW_AS_ROLE_KEY = "anasac_view_as_role";
export const VIEW_AS_EVENT = "anasac-view-as-change";

export function isRole(value: string | null): value is Role {
  return Boolean(value && value in ROLE_LABELS);
}

export function readViewAsRole(): Role | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(VIEW_AS_ROLE_KEY);
    return isRole(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function writeViewAsRole(role: Role | null) {
  if (typeof window === "undefined") return;
  try {
    if (!role || role === "administrador") {
      sessionStorage.removeItem(VIEW_AS_ROLE_KEY);
    } else if (ALL_ROLES.includes(role)) {
      sessionStorage.setItem(VIEW_AS_ROLE_KEY, role);
    }
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(VIEW_AS_EVENT));
}

export function subscribeViewAsRole(onChange: () => void) {
  window.addEventListener(VIEW_AS_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(VIEW_AS_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
