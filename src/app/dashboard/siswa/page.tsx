import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format-date";
import { expForNextLevel, normalizeKuisSpelling } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { SymmetricMenuGrid } from "@/components/dashboard/symmetric-menu-grid";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Coins,
  HelpCircle,
  MessageCircle,
  ShoppingBag,
  Star,
  Trophy,
  Medal,
  Package,
} from "lucide-react";

export default async function StudentDashboard() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("dashboard.siswa");
  const tc = await getTranslations("common");

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session!.user.id },
  });

  const enrollments = await prisma.classEnrollment.count({
    where: { studentId: session!.user.id },
  });

  const lastAttempt = await prisma.quizAttempt.findFirst({
    where: { studentId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { quiz: { include: { class: true } } },
  });

  const level = profile?.currentLevel ?? 1;
  const exp = profile?.currentExp ?? 0;
  const nextExp = expForNextLevel(level);
  // Offset exp di dalam band level saat ini (level 1: band mulai dari 0)
  const bandStart = 50 * level * (level - 1);
  const offset = Math.max(0, exp - bandStart);
  const progress = Math.min(100, Math.round((offset / nextExp) * 100));

  const quickLinks = [
    { href: "/kelas", title: t("selectClass"), icon: BookOpen, iconClassName: "text-primary" },
    { href: "/peringkat", title: t("championRanking"), icon: Medal, iconClassName: "text-amber-500" },
    { href: "/toko", title: t("rewardShop"), icon: ShoppingBag, iconClassName: "text-secondary" },
    { href: "/inventori", title: t("inventory"), icon: Package, iconClassName: "text-primary" },
    { href: "/laporan", title: t("adventureReport"), icon: Trophy, iconClassName: "text-tertiary" },
    { href: "/pesan", title: t("discussionMessages"), icon: MessageCircle, iconClassName: "text-tertiary" },
    { href: "/bantuan", title: t("help"), icon: HelpCircle, iconClassName: "text-primary" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title={t("greeting", { name: session!.user.nama })}
        description={t("description")}
      />

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="primary">{tc("level")} {level}</Badge>
              <CardTitle className="mt-2">{t("adventureProgress")}</CardTitle>
              <CardDescription>
                {t("expProgress", { current: exp, next: nextExp, level: level + 1 })}
              </CardDescription>
            </div>
            <Star className="h-10 w-10 text-secondary" />
          </div>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-primary/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-tertiary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </Card>

        <Card className="text-center">
          <Coins className="mx-auto mb-2 h-8 w-8 text-secondary" />
          <p className="font-display text-3xl font-bold text-secondary">
            {profile?.virtualCurrency ?? 0}
          </p>
          <p className="text-sm text-muted">{t("virtualCoins")}</p>
        </Card>
      </div>

      <div className="mb-8">
        <SymmetricMenuGrid items={quickLinks} columns={3} compact />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>{t("enrolledClasses")}</CardTitle>
          <CardDescription>{t("activeClasses", { count: enrollments })}</CardDescription>
          <Link href="/kelas" className="mt-4 inline-block">
            <Button size="sm">{t("viewAllClasses")}</Button>
          </Link>
        </Card>

        <Card>
          <CardTitle>{t("lastQuizWorked")}</CardTitle>
          {!lastAttempt ? (
            <CardDescription>{t("noQuizzesCompleted")}</CardDescription>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-surface px-3 py-3">
                <p className="font-semibold text-foreground">
                  {normalizeKuisSpelling(lastAttempt.quiz.title)}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {t("lastQuizClass", {
                    className: lastAttempt.quiz.class.title,
                  })}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {t("lastQuizSummary", {
                    correct: lastAttempt.correctAnswers,
                    total: lastAttempt.totalQuestions,
                  })}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {t("lastQuizWorkedAt", {
                    datetime: formatDateTime(lastAttempt.createdAt, locale),
                  })}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={lastAttempt.score >= 60 ? "primary" : "secondary"}
                >
                  {lastAttempt.score}%
                </Badge>
                <Link href="/laporan">
                  <Button size="sm" variant="outline">
                    {t("viewAdventureReport")}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}