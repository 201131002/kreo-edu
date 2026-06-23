import type { ScheduleColor, ScheduleDay } from "@/generated/prisma/client";

export const SCHEDULE_DAYS: ScheduleDay[] = [
  "SENIN",
  "SELASA",
  "RABU",
  "KAMIS",
  "JUMAT",
  "SABTU",
  "MINGGU",
];

export const WEEKDAY_DAYS: ScheduleDay[] = [
  "SENIN",
  "SELASA",
  "RABU",
  "KAMIS",
  "JUMAT",
];

export const DAY_LABELS: Record<ScheduleDay, string> = {
  SENIN: "Senin",
  SELASA: "Selasa",
  RABU: "Rabu",
  KAMIS: "Kamis",
  JUMAT: "Jumat",
  SABTU: "Sabtu",
  MINGGU: "Minggu",
};

export const COLOR_LABELS: Record<ScheduleColor, string> = {
  primary: "Biru",
  secondary: "Emas",
  tertiary: "Ungu",
};

export function daySortIndex(day: ScheduleDay): number {
  return SCHEDULE_DAYS.indexOf(day);
}

export function formatScheduleTime(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}