import { parseAnswersJson } from "@/lib/quiz-attempt";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const PASS_THRESHOLD = 60;

export type GuruAnalyticsFilters = {
  classId?: string;
  quizId?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

export type QuizAvgScore = {
  quizId: string;
  quizTitle: string;
  classTitle: string;
  avgScore: number;
  attemptCount: number;
};

export type ScoreHistogram = {
  low: number;
  medium: number;
  high: number;
  total: number;
};

export type HardestQuestion = {
  questionId: string;
  questionText: string;
  quizTitle: string;
  wrongCount: number;
  totalAnswers: number;
  errorRate: number;
};

export type StudentNotPassed = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  quizId: string;
  quizTitle: string;
  classTitle: string;
  bestScore: number;
  lastAttemptAt: Date | null;
};

export type StudentNotAttempted = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  quizId: string;
  quizTitle: string;
  classTitle: string;
};

export type GuruAnalyticsSummary = {
  filters: GuruAnalyticsFilters;
  quizAvgScores: QuizAvgScore[];
  histogram: ScoreHistogram;
  hardestQuestions: HardestQuestion[];
  studentsNotPassed: StudentNotPassed[];
  studentsNotAttempted: StudentNotAttempted[];
};

export async function verifyTeacherOwnsClass(
  teacherId: string,
  classId: string
): Promise<boolean> {
  const cls = await prisma.class.findFirst({
    where: { id: classId, teacherId },
    select: { id: true },
  });
  return !!cls;
}

export async function verifyTeacherOwnsQuiz(
  teacherId: string,
  quizId: string
): Promise<boolean> {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, class: { teacherId } },
    select: { id: true },
  });
  return !!quiz;
}

function buildQuizWhere(
  teacherId: string,
  filters: GuruAnalyticsFilters
): Prisma.QuizWhereInput {
  return {
    class: { teacherId },
    ...(filters.classId ? { classId: filters.classId } : {}),
    ...(filters.quizId ? { id: filters.quizId } : {}),
  };
}

function buildAttemptWhere(
  teacherId: string,
  filters: GuruAnalyticsFilters
): Prisma.QuizAttemptWhereInput {
  const where: Prisma.QuizAttemptWhereInput = {
    quiz: buildQuizWhere(teacherId, filters),
  };

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      where.createdAt.gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  return where;
}

export async function getTeacherClassesForAnalytics(teacherId: string) {
  return prisma.class.findMany({
    where: { teacherId },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
}

export async function getTeacherQuizzesForAnalytics(
  teacherId: string,
  classId?: string
) {
  return prisma.quiz.findMany({
    where: {
      class: { teacherId },
      ...(classId ? { classId } : {}),
    },
    select: {
      id: true,
      title: true,
      class: { select: { title: true } },
    },
    orderBy: { title: "asc" },
  });
}

export async function getQuizAvgScores(
  teacherId: string,
  filters: GuruAnalyticsFilters
): Promise<QuizAvgScore[]> {
  const grouped = await prisma.quizAttempt.groupBy({
    by: ["quizId"],
    where: buildAttemptWhere(teacherId, filters),
    _avg: { score: true },
    _count: { id: true },
  });

  if (grouped.length === 0) return [];

  const quizIds = grouped.map((g) => g.quizId);
  const quizzes = await prisma.quiz.findMany({
    where: { id: { in: quizIds }, class: { teacherId } },
    select: {
      id: true,
      title: true,
      class: { select: { title: true } },
    },
  });

  const quizMap = new Map(quizzes.map((q) => [q.id, q]));

  return grouped
    .map((g) => {
      const quiz = quizMap.get(g.quizId);
      if (!quiz) return null;
      return {
        quizId: g.quizId,
        quizTitle: quiz.title,
        classTitle: quiz.class.title,
        avgScore: Math.round(g._avg.score ?? 0),
        attemptCount: g._count.id,
      };
    })
    .filter((row): row is QuizAvgScore => row !== null)
    .sort((a, b) => a.classTitle.localeCompare(b.classTitle) || a.quizTitle.localeCompare(b.quizTitle));
}

export async function getScoreHistogram(
  teacherId: string,
  filters: GuruAnalyticsFilters
): Promise<ScoreHistogram> {
  const attempts = await prisma.quizAttempt.findMany({
    where: buildAttemptWhere(teacherId, filters),
    select: { score: true },
  });

  const histogram: ScoreHistogram = {
    low: 0,
    medium: 0,
    high: 0,
    total: attempts.length,
  };

  for (const attempt of attempts) {
    if (attempt.score < 60) {
      histogram.low += 1;
    } else if (attempt.score < 80) {
      histogram.medium += 1;
    } else {
      histogram.high += 1;
    }
  }

  return histogram;
}

export async function getHardestQuestions(
  teacherId: string,
  filters: GuruAnalyticsFilters,
  limit = 10
): Promise<HardestQuestion[]> {
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      ...buildAttemptWhere(teacherId, filters),
      answersJson: { not: null },
    },
    select: {
      answersJson: true,
      quizId: true,
    },
  });

  if (attempts.length === 0) return [];

  const quizIds = [...new Set(attempts.map((a) => a.quizId))];
  const questions = await prisma.question.findMany({
    where: { quizId: { in: quizIds } },
    select: {
      id: true,
      questionText: true,
      correctOption: true,
      quiz: { select: { title: true, class: { select: { teacherId: true } } } },
    },
  });

  const questionMap = new Map(
    questions
      .filter((q) => q.quiz.class.teacherId === teacherId)
      .map((q) => [q.id, q])
  );

  const stats = new Map<string, { wrong: number; total: number }>();

  for (const attempt of attempts) {
    const parsed = parseAnswersJson(attempt.answersJson);

    for (const answer of parsed) {
      const questionId = answer.questionId;
      const selected = answer.selected;
      const question = questionMap.get(questionId);
      if (!question || !selected) continue;

      const current = stats.get(questionId) ?? { wrong: 0, total: 0 };
      current.total += 1;
      if (selected !== question.correctOption) {
        current.wrong += 1;
      }
      stats.set(questionId, current);
    }
  }

  const hardest: HardestQuestion[] = [];

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

export async function getStudentsNotPassed(
  teacherId: string,
  filters: GuruAnalyticsFilters
): Promise<StudentNotPassed[]> {
  const quizzes = await prisma.quiz.findMany({
    where: buildQuizWhere(teacherId, filters),
    select: {
      id: true,
      title: true,
      class: {
        select: {
          title: true,
          enrollments: {
            select: {
              student: {
                select: { id: true, nama: true, email: true },
              },
            },
          },
        },
      },
    },
  });

  const attempts = await prisma.quizAttempt.findMany({
    where: buildAttemptWhere(teacherId, filters),
    select: {
      quizId: true,
      studentId: true,
      score: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const bestByStudentQuiz = new Map<string, { bestScore: number; lastAttemptAt: Date }>();

  for (const attempt of attempts) {
    const key = `${attempt.studentId}:${attempt.quizId}`;
    const existing = bestByStudentQuiz.get(key);
    if (!existing || attempt.score > existing.bestScore) {
      bestByStudentQuiz.set(key, {
        bestScore: attempt.score,
        lastAttemptAt: attempt.createdAt,
      });
    }
  }

  const result: StudentNotPassed[] = [];

  for (const quiz of quizzes) {
    for (const enrollment of quiz.class.enrollments) {
      const key = `${enrollment.student.id}:${quiz.id}`;
      const best = bestByStudentQuiz.get(key);
      if (!best || best.bestScore < PASS_THRESHOLD) {
        result.push({
          studentId: enrollment.student.id,
          studentName: enrollment.student.nama,
          studentEmail: enrollment.student.email,
          quizId: quiz.id,
          quizTitle: quiz.title,
          classTitle: quiz.class.title,
          bestScore: best?.bestScore ?? 0,
          lastAttemptAt: best?.lastAttemptAt ?? null,
        });
      }
    }
  }

  return result.sort(
    (a, b) =>
      a.classTitle.localeCompare(b.classTitle) ||
      a.quizTitle.localeCompare(b.quizTitle) ||
      a.studentName.localeCompare(b.studentName)
  );
}

export async function getStudentsNotAttempted(
  teacherId: string,
  filters: GuruAnalyticsFilters
): Promise<StudentNotAttempted[]> {
  const quizzes = await prisma.quiz.findMany({
    where: buildQuizWhere(teacherId, filters),
    select: {
      id: true,
      title: true,
      class: {
        select: {
          title: true,
          enrollments: {
            select: {
              student: {
                select: { id: true, nama: true, email: true },
              },
            },
          },
        },
      },
    },
  });

  const attempts = await prisma.quizAttempt.findMany({
    where: buildAttemptWhere(teacherId, filters),
    select: { quizId: true, studentId: true },
  });

  const attempted = new Set(attempts.map((a) => `${a.studentId}:${a.quizId}`));
  const result: StudentNotAttempted[] = [];

  for (const quiz of quizzes) {
    for (const enrollment of quiz.class.enrollments) {
      const key = `${enrollment.student.id}:${quiz.id}`;
      if (!attempted.has(key)) {
        result.push({
          studentId: enrollment.student.id,
          studentName: enrollment.student.nama,
          studentEmail: enrollment.student.email,
          quizId: quiz.id,
          quizTitle: quiz.title,
          classTitle: quiz.class.title,
        });
      }
    }
  }

  return result.sort(
    (a, b) =>
      a.classTitle.localeCompare(b.classTitle) ||
      a.quizTitle.localeCompare(b.quizTitle) ||
      a.studentName.localeCompare(b.studentName)
  );
}

export async function getGuruAnalyticsSummary(
  teacherId: string,
  filters: GuruAnalyticsFilters
): Promise<GuruAnalyticsSummary> {
  const [quizAvgScores, histogram, hardestQuestions, studentsNotPassed, studentsNotAttempted] =
    await Promise.all([
      getQuizAvgScores(teacherId, filters),
      getScoreHistogram(teacherId, filters),
      getHardestQuestions(teacherId, filters),
      getStudentsNotPassed(teacherId, filters),
      getStudentsNotAttempted(teacherId, filters),
    ]);

  return {
    filters,
    quizAvgScores,
    histogram,
    hardestQuestions,
    studentsNotPassed,
    studentsNotAttempted,
  };
}

export function parseAnalyticsFilters(searchParams: {
  classId?: string;
  quizId?: string;
  from?: string;
  to?: string;
}): GuruAnalyticsFilters {
  const filters: GuruAnalyticsFilters = {};

  if (searchParams.classId) {
    filters.classId = searchParams.classId;
  }
  if (searchParams.quizId) {
    filters.quizId = searchParams.quizId;
  }
  if (searchParams.from) {
    const dateFrom = new Date(searchParams.from);
    if (!Number.isNaN(dateFrom.getTime())) {
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

export async function validateAnalyticsFilters(
  teacherId: string,
  filters: GuruAnalyticsFilters
): Promise<GuruAnalyticsFilters> {
  const validated: GuruAnalyticsFilters = {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  };

  if (filters.classId) {
    const ownsClass = await verifyTeacherOwnsClass(teacherId, filters.classId);
    if (ownsClass) {
      validated.classId = filters.classId;
    }
  }

  if (filters.quizId) {
    const ownsQuiz = await verifyTeacherOwnsQuiz(teacherId, filters.quizId);
    if (ownsQuiz) {
      validated.quizId = filters.quizId;
    }
  }

  return validated;
}