import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatStat(value) {
    if (!value) return "0";
    return value > 0 ? `+${value}` : `${value}`;
}
