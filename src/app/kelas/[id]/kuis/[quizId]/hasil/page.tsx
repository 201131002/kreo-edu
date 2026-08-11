import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { PartyPopper, Coins, Star, Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format-date";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function HasilKuisPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; quizId: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}) {
  const { id, quizId } = await params;
  const sp = await searchParams;
  const session = await auth();

  if (!session || session.user.role !== "SISWA") {
    redirect("/masuk");
  }

  if (!sp.attemptId) {
    redirect(`/kelas/${id}/kuis/${quizId}`);
  }

  const attempt = await prisma.quizAttempt.findFirst({
    where: {
      id: sp.attemptId,
      studentId: session.user.id,
      quizId,
      quiz: { classId: id },
    },
    include: {
      quiz: true,
    },
  });

  if (!attempt) notFound();

  const locale = await getLocale();
  const t = await getTranslations("quizResult");

  const earlierAttempts = await prisma.quizAttempt.count({
    where: {
      studentId: session.user.id,
      quizId,
      createdAt: { lt: attempt.createdAt },
    },
  });

  const passed = attempt.score >= 60;
  const earnedRewards = attempt.coinsEarned > 0 || attempt.expEarned > 0;
  const isFirstAttempt = earlierAttempts === 0;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4 py-16">
      <Card className="w-full text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary text-white">
          <PartyPopper className="h-10 w-10" />
        </div>

        <Badge variant={passed ? "primary" : "secondary"} className="mb-3">
          {passed ? t("passedBadge") : t("retryBadge")}
        </Badge>

        <CardTitle className="text-2xl">
          {passed ? t("passedTitle") : t("retryTitle")}
        </CardTitle>
        <CardDescription className="mt-2">
          {t("summary", {
            correct: attempt.correctAnswers,
            total: attempt.totalQuestions,
          })}
        </CardDescription>

        <p className="mt-3 inline-flex items-center justify-center gap-2 text-sm text-muted">
          <Clock className="h-4 w-4" />
          {t("completedAt", {
            datetime: formatDateTime(attempt.createdAt, locale),
          })}
        </p>

        <p className="mt-6 font-display text-5xl font-bold text-primary">
          {attempt.score}%
        </p>

        {earnedRewards ? (
          <div className="mt-6 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-tertiary" />
              <span className="font-bold text-tertiary">+{attempt.expEarned} EXP</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-secondary" />
              <span className="font-bold text-secondary">+{attempt.coinsEarned} Koin</span>
            </div>
          </div>
        ) : (
          <p className="mt-6 rounded-2xl bg-surface px-4 py-3 text-sm text-muted">
            {isFirstAttempt
              ? t("noRewardFirst")
              : t("noRewardRetry")}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Link href={`/kelas/${id}/materi`}>
            <Button className="w-full">{t("backToClass")}</Button>
          </Link>
          <Link href={`/kelas/${id}/kuis/${quizId}`}>
            <Button variant="outline" className="w-full">
              {t("tryAgain")}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}