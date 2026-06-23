import type { BankSubject } from "@/generated/prisma/client";

export const BANK_SUBJECTS: BankSubject[] = [
  "MATEMATIKA",
  "BAHASA_INDONESIA",
  "IPAS",
  "PENDIDIKAN_PANCASILA",
  "BAHASA_INGGRIS",
];

export const SUBJECT_LABELS: Record<BankSubject, string> = {
  MATEMATIKA: "Matematika",
  BAHASA_INDONESIA: "Bahasa Indonesia",
  IPAS: "IPAS (Alam & Sosial)",
  PENDIDIKAN_PANCASILA: "Pendidikan Pancasila",
  BAHASA_INGGRIS: "Bahasa Inggris",
};

export const GRADE_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

export function gradeLabel(grade: number): string {
  return `Kelas ${grade}`;
}