import type { BadgeCriteria } from "@/generated/prisma/client";

export function badgeUnlockLabel(
  criteria: BadgeCriteria,
  criteriaValue: number
): string {
  switch (criteria) {
    case "LEVEL":
      return `Capai Level ${criteriaValue}`;
    case "QUIZ_COUNT":
      return `Selesaikan ${criteriaValue} kuis`;
    case "FIRST_QUIZ":
      return "Selesaikan kuis pertamamu";
    default:
      return "Selesaikan syarat lencana";
  }
}