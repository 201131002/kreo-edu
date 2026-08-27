import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type DbClient = Prisma.TransactionClient | typeof prisma;

async function grantBadges(
  studentProfileId: string,
  badgeIds: string[],
  client: DbClient
): Promise<number> {
  if (badgeIds.length === 0) return 0;

  const existing = await client.studentBadge.findMany({
    where: {
      studentId: studentProfileId,
      badgeId: { in: badgeIds },
    },
    select: { badgeId: true },
  });

  const owned = new Set(existing.map((e) => e.badgeId));
  const toCreate = badgeIds.filter((id) => !owned.has(id));

  if (toCreate.length === 0) return 0;

  await client.studentBadge.createMany({
    data: toCreate.map((badgeId) => ({
      studentId: studentProfileId,
      badgeId,
    })),
    skipDuplicates: true,
  });

  return toCreate.length;
}

export async function syncEarnedBadges(
  studentProfileId: string,
  userId: string,
  level: number,
  client: DbClient = prisma
): Promise<number> {
  const distinctQuizAttempts = await client.quizAttempt.findMany({
    where: { studentId: userId },
    select: { quizId: true },
    distinct: ["quizId"],
  });
  const quizCount = distinctQuizAttempts.length;

  const allBadges = await client.badge.findMany({
    select: { id: true, criteria: true, criteriaValue: true },
  });

  const eligibleIds = allBadges
    .filter((badge) => {
      switch (badge.criteria) {
        case "LEVEL":
          return level >= badge.criteriaValue;
        case "QUIZ_COUNT":
          return quizCount >= badge.criteriaValue;
        case "FIRST_QUIZ":
          // criteriaValue=0 (badge Perdana) berarti kuis pertama; >0 berarti N kuis berbeda
          return quizCount >= Math.max(1, badge.criteriaValue);
        default:
          return false;
      }
    })
    .map((b) => b.id);

  return grantBadges(studentProfileId, eligibleIds, client);
}