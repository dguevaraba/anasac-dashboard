import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export {
  formatDate,
  formatDateTime,
  formatTimeMs,
  getAge,
  formatCrc,
  daysUntil,
} from "@anasac/shared";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
