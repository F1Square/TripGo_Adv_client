import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Round distance: if fractional part > 0.5, round up by 1; otherwise round down.
// Example: 17.90 -> 18, 17.49 -> 17, 17.50 -> 17 (as per > 0.5 rule)
export function roundDistanceKm(value: number | undefined | null): number {
  const num = typeof value === 'number' && isFinite(value) ? value : 0;
  const floor = Math.floor(num);
  const fractional = num - floor;
  return floor + (fractional > 0.5 ? 1 : 0);
}
