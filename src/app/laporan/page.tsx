export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { formatDateTime } from "@/lib/format-date";
import { normalizeKuisSpelling } from "@/lib/utils";
import {
  enrichAnswersFromQuestions,
  parseAnswersJson,
} from "@/lib/quiz-attempt";
import { PageHeader } from "@/components/layout/page-header";
import { AttemptRow } from "@/components/laporan/attempt-row";
import {
  LAPORAN_PAGE_SIZE,
  LaporanPagination,
} from "@/components/laporan/laporan-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardDescription } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("laporan");
  const tc = await getTranslations("common");
  const sp = await searchParams;
  const currentPage = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const studentId = session!.user.id;

  const [totalCount, aggregates, attempts] = await Promise.all([
    prisma.quizAttempt.count({ where: { studentId } }),
    prisma.quizAttempt.aggregate({
      where: { studentId },
      _sum: { expEarned: true, coinsEarned: true },
      _avg: { score: true },
    }),
    prisma.quizAttempt.findMany({
      where: { studentId },
      include: { quiz: { include: { class: true } } },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * LAPORAN_PAGE_SIZE,
      take: LAPORAN_PAGE_SIZE,
    }),
  ]);

  const quizIds = [...new Set(attempts.map((a) => a.quizId))];
  const questions =
    quizIds.length > 0
      ? await prisma.question.findMany({
          where: { quizId: { in: quizIds } },
          select: {
            id: true,
            quizId: true,
            questionText: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            correctOption: true,
          },
        })
      : [];

  const totalExp = aggregates._sum.expEarned ?? 0;
  const totalCoins = aggregates._sum.coinsEarned ?? 0;
  const avgScore = Math.round(aggregates._avg.score ?? 0);

  const attemptMeta = attempts.map((attempt) => ({
    id: attempt.id,
    quizTitle: normalizeKuisSpelling(attempt.quiz.title),
    classTitle: attempt.quiz.class.title,
    correctAnswers: attempt.correctAnswers,
    totalQuestions: attempt.totalQuestions,
    score: attempt.score,
    expEarned: attempt.expEarned,
    coinsEarned: attempt.coinsEarned,
    completedAt: formatDateTime(attempt.createdAt, locale),
    answers: enrichAnswersFromQuestions(
      parseAnswersJson(attempt.answersJson),
      questions.filter((q) => q.quizId === attempt.quizId)
    ),
  }));

  const showingFrom =
    totalCount === 0 ? 0 : (currentPage - 1) * LAPORAN_PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * LAPORAN_PAGE_SIZE, totalCount);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader title={t("title")} description={t("description")} />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <Trophy className="mx-auto mb-2 h-8 w-8 text-primary" />
          <p className="font-display text-2xl font-bold">{totalCount}</p>
          <CardDescription>{t("quizzesCompleted")}</CardDescription>
        </Card>
        <Card className="text-center">
          <p className="font-display text-2xl font-bold text-tertiary">+{totalExp}</p>
          <CardDescription>{t("totalExp")}</CardDescription>
        </Card>
        <Card className="text-center">
          <p className="font-display text-2xl font-bold text-secondary">+{totalCoins}</p>
          <CardDescription>{t("totalCoins", { avg: avgScore })}</CardDescription>
        </Card>
      </div>

      {totalCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
          <p>
            {tc("showingRange", { from: showingFrom, to: showingTo, total: totalCount })}
          </p>
          {totalCount > LAPORAN_PAGE_SIZE && (
            <p>
              {tc("pageOf", {
                page: currentPage,
                total: Math.ceil(totalCount / LAPORAN_PAGE_SIZE),
              })}
            </p>
          )}
        </div>
      )}

      {totalCount === 0 ? (
        <EmptyState
          icon={Trophy}
          title={t("noAdventures")}
          description={t("noAdventuresDesc")}
        />
      ) : (
        <div className="space-y-3">
          {attemptMeta.map((attempt) => (
            <AttemptRow key={attempt.id} attemptId={attempt.id} {...attempt} />
          ))}
        </div>
      )}

      <LaporanPagination currentPage={currentPage} totalCount={totalCount} />
    </div>
  );
}