import { getWeekStartKey } from "@/lib/guru-analytics";
import { prisma } from "@/lib/prisma";
import { parseAnswersJson } from "@/lib/quiz-attempt";

export type AdminAnalyticsFilters = {
  dateFrom?: Date;
  dateTo?: Date;
};

export type WeeklyGrowth = {
  weekStart: Date;
  newUsers: number;
  newAttempts: number;
};

export type ClassRankingRow = {
  classId: string;
  classTitle: string;
  teacherName: string;
  studentCount: number;
  attemptCount: number;
  avgScore: number;
};

export type HardestQuestionPlatform = {
  questionId: string;
  questionText: string;
  quizTitle: string;
  wrongCount: number;
  totalAnswers: number;
  errorRate: number;
};

export type AdminAnalyticsSummary = {
  filters: AdminAnalyticsFilters;
  totalUsers: number;
  roleCounts: { SISWA: number; GURU: number; ADMIN: number };
  activeUsers7d: number;
  activeUsers30d: number;
  totalClasses: number;
  totalQuizzes: number;
  totalAttempts: number;
  avgScore: number;
  weeklyGrowth: WeeklyGrowth[];
  classRanking: ClassRankingRow[];
  hardestQuestions: HardestQuestionPlatform[];
};

function buildAttemptWhere(filters: AdminAnalyticsFilters) {
  const where: Record<string, unknown> = {};
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) (where.createdAt as { gte?: Date }).gte = filters.dateFrom;
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      (where.createdAt as { lte?: Date }).lte = end;
    }
  }
  return where;
}

async function getWeeklyGrowth(
  filters: AdminAnalyticsFilters,
  weeks = 8
): Promise<WeeklyGrowth[]> {
  const dateTo =
    filters.dateTo ??
    (() => {
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      return now;
    })();

  const rawStart = new Date(dateTo);
  rawStart.setDate(rawStart.getDate() - (weeks * 7 - 1));
  const start = new Date(getWeekStartKey(rawStart));

  const createdAtWhere: { gte: Date; lte?: Date } = { gte: start };
  // Respect dateFrom if it's later than the 8-week window start
  if (filters.dateFrom && filters.dateFrom.getTime() > start.getTime()) {
    createdAtWhere.gte = filters.dateFrom;
  }
  // Respect dateTo upper bound, inclusive up to end of that day
  if (filters.dateTo) {
    const end = new Date(filters.dateTo);
    end.setHours(23, 59, 59, 999);
    createdAtWhere.lte = end;
  }

  const [users, attempts] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: createdAtWhere },
      select: { createdAt: true },
    }),
    prisma.quizAttempt.findMany({
      where: { createdAt: createdAtWhere },
      select: { createdAt: true },
    }),
  ]);

  const bucketKeys: string[] = [];
  for (let i = 0; i < weeks; i += 1) {
    const ws = new Date(start);
    ws.setDate(ws.getDate() + i * 7);
    bucketKeys.push(ws.toISOString());
  }

  const userBuckets = new Map(bucketKeys.map((k) => [k, 0]));
  for (const u of users) {
    const key = getWeekStartKey(u.createdAt);
    if (userBuckets.has(key)) {
      userBuckets.set(key, userBuckets.get(key)! + 1);
    }
  }

  const attemptBuckets = new Map(bucketKeys.map((k) => [k, 0]));
  for (const a of attempts) {
    const key = getWeekStartKey(a.createdAt);
    if (attemptBuckets.has(key)) {
      attemptBuckets.set(key, attemptBuckets.get(key)! + 1);
    }
  }

  return bucketKeys.map((key) => ({
    weekStart: new Date(key),
    newUsers: userBuckets.get(key)!,
    newAttempts: attemptBuckets.get(key)!,
  }));
}

async function getActiveUserCounts(): Promise<{ d7: number; d30: number }> {
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [a7, a30] = await Promise.all([
    prisma.quizAttempt.groupBy({
      by: ["studentId"],
      where: { createdAt: { gte: d7 } },
    }),
    prisma.quizAttempt.groupBy({
      by: ["studentId"],
      where: { createdAt: { gte: d30 } },
    }),
  ]);

  return { d7: a7.length, d30: a30.length };
}

async function getClassRanking(
  filters: AdminAnalyticsFilters,
  limit = 10
): Promise<ClassRankingRow[]> {
  const classes = await prisma.class.findMany({
    select: {
      id: true,
      title: true,
      teacher: { select: { nama: true } },
      _count: { select: { enrollments: true } },
    },
  });

  const grouped = await prisma.quizAttempt.groupBy({
    by: ["quizId"],
    where: buildAttemptWhere(filters),
    _avg: { score: true },
    _count: { id: true },
  });

  if (grouped.length === 0) return [];

  const quizzes = await prisma.quiz.findMany({
    where: { id: { in: grouped.map((g) => g.quizId) } },
    select: { id: true, classId: true },
  });
  const quizToClass = new Map(quizzes.map((q) => [q.id, q.classId]));

  const perClass = new Map<string, { scoreSum: number; count: number }>();
  for (const g of grouped) {
    const classId = quizToClass.get(g.quizId);
    if (!classId) continue;
    const current = perClass.get(classId) ?? { scoreSum: 0, count: 0 };
    current.scoreSum += (g._avg.score ?? 0) * g._count.id;
    current.count += g._count.id;
    perClass.set(classId, current);
  }

  return classes
    .filter((c) => perClass.has(c.id))
    .map((c) => {
      const agg = perClass.get(c.id)!;
      return {
        classId: c.id,
        classTitle: c.title,
        teacherName: c.teacher.nama,
        studentCount: c._count.enrollments,
        attemptCount: agg.count,
        avgScore: Math.round(agg.scoreSum / agg.count),
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore || b.attemptCount - a.attemptCount)
    .slice(0, limit);
}

async function getHardestQuestionsPlatform(
  filters: AdminAnalyticsFilters,
  limit = 10
): Promise<HardestQuestionPlatform[]> {
  const attempts = await prisma.quizAttempt.findMany({
    where: { ...buildAttemptWhere(filters), answersJson: { not: null } },
    select: { answersJson: true, quizId: true },
  });

  if (attempts.length === 0) return [];

  const quizIds = [...new Set(attempts.map((a) => a.quizId))];
  const questions = await prisma.question.findMany({
    where: { quizId: { in: quizIds } },
    select: {
      id: true,
      questionText: true,
      correctOption: true,
      quiz: { select: { title: true } },
    },
  });
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  const stats = new Map<string, { wrong: number; total: number }>();
  for (const attempt of attempts) {
    for (const answer of parseAnswersJson(attempt.answersJson)) {
      const question = questionMap.get(answer.questionId);
      if (!question || !answer.selected) continue;
      const current = stats.get(answer.questionId) ?? { wrong: 0, total: 0 };
      current.total += 1;
      if (answer.selected !== question.correctOption) {
        current.wrong += 1;
      }
      stats.set(answer.questionId, current);
    }
  }

  const hardest: HardestQuestionPlatform[] = [];
  for (const [questionId, { wrong, total }] of stats.entries()) {
    const question = questionMap.get(questionId);
    if (!question || total === 0) continue;
    hardest.push({
      questionId,
      questionText: question.questionText,
      quizTitle: question.quiz.title,
      wrongCount: wrong,
      totalAnswers: total,
      errorRate: Math.round((wrong / total) * 100),
    });
  }

  return hardest
    .sort((a, b) => b.errorRate - a.errorRate || b.wrongCount - a.wrongCount)
    .slice(0, limit);
}

export async function getAdminAnalyticsSummary(
  filters: AdminAnalyticsFilters
): Promise<AdminAnalyticsSummary> {
  const [
    totalUsers,
    roleCountsGrouped,
    active,
    totalClasses,
    totalQuizzes,
    attemptAgg,
    weeklyGrowth,
    classRanking,
    hardestQuestions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
    getActiveUserCounts(),
    prisma.class.count(),
    prisma.quiz.count(),
    prisma.quizAttempt.aggregate({
      where: buildAttemptWhere(filters),
      _count: { id: true },
      _avg: { score: true },
    }),
    getWeeklyGrowth(filters),
    getClassRanking(filters),
    getHardestQuestionsPlatform(filters),
  ]);

  const roleCounts = { SISWA: 0, GURU: 0, ADMIN: 0 } as {
    SISWA: number;
    GURU: number;
    ADMIN: number;
  };
  for (const row of roleCountsGrouped) {
    roleCounts[row.role] = row._count.id;
  }

  const totalAttempts = attemptAgg._count.id;

  return {
    filters,
    totalUsers,
    roleCounts,
    activeUsers7d: active.d7,
    activeUsers30d: active.d30,
    totalClasses,
    totalQuizzes,
    totalAttempts,
    avgScore: Math.round(attemptAgg._avg.score ?? 0),
    weeklyGrowth,
    classRanking,
    hardestQuestions,
  };
}

export function parseAdminAnalyticsFilters(searchParams: {
  from?: string;
  to?: string;
}): AdminAnalyticsFilters {
  const filters: AdminAnalyticsFilters = {};
  if (searchParams.from) {
    const dateFrom = new Date(searchParams.from);
    if (!Number.isNaN(dateFrom.getTime())) {
      // date-only values parse as UTC midnight; normalize to local day start
      dateFrom.setHours(0, 0, 0, 0);
      filters.dateFrom = dateFrom;
    }
  }
  if (searchParams.to) {
    const dateTo = new Date(searchParams.to);
    if (!Number.isNaN(dateTo.getTime())) {
      filters.dateTo = dateTo;
    }
  }
  return filters;
}
