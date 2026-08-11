import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { BarChart3, BookOpen, Users, Zap } from "lucide-react";

export default async function AdminAnalitikPage() {
  const t = await getTranslations("admin.analytics");

  const [userCount, classCount, quizCount, attemptCount, avgScore] = await Promise.all([
    prisma.user.count(),
    prisma.class.count(),
    prisma.quiz.count(),
    prisma.quizAttempt.count(),
    prisma.quizAttempt.aggregate({ _avg: { score: true } }),
  ]);

  const stats = [
    { label: t("totalUsers"), value: userCount, icon: Users },
    { label: t("totalClasses"), value: classCount, icon: BookOpen },
    { label: t("totalQuizzes"), value: quizCount, icon: Zap },
    { label: t("completedQuizzes"), value: attemptCount, icon: BarChart3 },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader title={t("title")} description={t("description")} />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="text-center">
              <Icon className="mx-auto mb-2 h-8 w-8 text-primary" />
              <p className="font-display text-3xl font-bold text-primary">{s.value}</p>
              <CardDescription>{s.label}</CardDescription>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardTitle>{t("avgScoreTitle")}</CardTitle>
        <p className="mt-2 font-display text-4xl font-bold text-tertiary">
          {Math.round(avgScore._avg.score ?? 0)}%
        </p>
        <CardDescription className="mt-2">
          {t("avgScoreDesc", { count: attemptCount })}
        </CardDescription>
      </Card>
    </div>
  );
}