import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function expForNextLevel(level: number): number {
  return level * 100;
}

/** Menyeragamkan ejaan "quis" → "Kuis" pada teks tampilan. */
export function normalizeKuisSpelling(text: string): string {
  return text.replace(/\bquis\b/gi, "Kuis");
}

export function calculateLevel(exp: number): number {
  let level = 1;
  let threshold = 100;
  let remaining = exp;

  while (remaining >= threshold) {
    remaining -= threshold;
    level += 1;
    threshold = level * 100;
  }

  return level;
}