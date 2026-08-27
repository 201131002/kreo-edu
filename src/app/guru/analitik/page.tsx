export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalyticsFilters } from "@/components/guru/analytics-filters";
import { AnalyticsExportButtons } from "@/components/guru/analytics-export-buttons";
import {
  getGuruAnalyticsSummary,
  getMaterialStats,
  getTeacherClassesForAnalytics,
  getTeacherQuizzesForAnalytics,
  parseAnalyticsFilters,
  validateAnalyticsFilters,
} from "@/lib/guru-analytics";
import { formatDateTime } from "@/lib/format-date";
import { normalizeKuisSpelling } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  Users,
  Zap,
} from "lucide-react";

function formatWeekLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export default async function GuruAnalitikPage({
  searchParams,
}: {
  searchParams: Promise<{
    classId?: string;
    quizId?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "GURU") {
    redirect("/dashboard/guru?error=unauthorized");
  }

  const locale = await getLocale();
  const t = await getTranslations("guru.analytics");
  const teacherId = session.user.id;
  const sp = await searchParams;

  const rawFilters = parseAnalyticsFilters(sp);
  const filters = await validateAnalyticsFilters(teacherId, rawFilters);

  const [classes, quizzes, summary, materialStats, classCount, studentCount] =
    await Promise.all([
      getTeacherClassesForAnalytics(teacherId),
      getTeacherQuizzesForAnalytics(
        teacherId,
        filters.classId
      ),
      getGuruAnalyticsSummary(teacherId, filters),
      getMaterialStats(teacherId),
      prisma.class.count({ where: { teacherId } }),
      prisma.classEnrollment.count({ where: { class: { teacherId } } }),
    ]);

  const totalAttempts = summary.histogram.total;

  // Siswa yang belum pernah attempt (bestScore 0, tanpa tanggal) bukan
  // kasus "Belum Lulus" — mereka sudah tercakup di daftar "Belum Mengerjakan".
  const studentsNotPassed = summary.studentsNotPassed.filter(
    (s) => !(s.lastAttemptAt === null && s.bestScore === 0)
  );
  const studentsNotAttempted = summary.studentsNotAttempted;

  const stats = [
    { label: t("myClasses"), value: classCount, icon: BookOpen },
    { label: t("enrolledStudents"), value: studentCount, icon: Users },
    { label: t("totalQuizzes"), value: quizzes.length, icon: Zap },
    { label: t("totalAttempts"), value: totalAttempts, icon: BarChart3 },
  ];

  const histogramBuckets = [
    { key: "bucketLow", value: summary.histogram.low, color: "bg-red-400" },
    { key: "bucketMid", value: summary.histogram.medium, color: "bg-secondary" },
    { key: "bucketHigh", value: summary.histogram.high, color: "bg-green-500" },
  ];
  const histogramMax = Math.max(...histogramBuckets.map((b) => b.value), 1);

  const trendMax = Math.max(...summary.weeklyTrend.map((w) => w.attemptCount), 1);
  const avgScoreAll =
    totalAttempts > 0
      ? Math.round(
          (summary.quizAvgScores.reduce((acc, q) => acc + q.avgScore * q.attemptCount, 0) /
            totalAttempts)
        )
      : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader title={t("title")} description={t("description")} />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="text-center">
              <Icon className="mx-auto mb-2 h-8 w-8 text-tertiary" />
              <p className="font-display text-3xl font-bold text-tertiary">{s.value}</p>
              <CardDescription>{s.label}</CardDescription>
            </Card>
          );
        })}
      </div>

      <Card className="mb-8">
        <CardTitle>{t("avgScoreTitle")}</CardTitle>
        <p className="mt-2 font-display text-4xl font-bold text-primary">
          {avgScoreAll}%
        </p>
        <CardDescription className="mt-2">
          {t("avgScoreDesc", { count: totalAttempts })}
        </CardDescription>
      </Card>

      <AnalyticsFilters
        classes={classes}
        quizzes={quizzes}
        currentClassId={filters.classId ?? ""}
        currentQuizId={filters.quizId ?? ""}
        currentFrom={sp.from ?? ""}
        currentTo={sp.to ?? ""}
        labels={{
          title: t("filterTitle"),
          description: t("filterDesc"),
          classLabel: t("classLabel"),
          quizLabel: t("quizLabel"),
          allClasses: t("allClasses"),
          allQuizzes: t("allQuizzes"),
          fromDate: t("fromDate"),
          toDate: t("toDate"),
          apply: t("applyFilter"),
          reset: t("resetFilter"),
        }}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-foreground">
          {t("title")}
        </h2>
        <AnalyticsExportButtons
          classId={filters.classId ?? ""}
          quizId={filters.quizId ?? ""}
          from={sp.from ?? ""}
          to={sp.to ?? ""}
          labels={{ excel: t("exportExcel"), pdf: t("exportPdf") }}
        />
      </div>

      {totalAttempts === 0 ? (
        <Card className="mb-8 border-primary/20 bg-secondary/10">
          <CardTitle className="flex items-center gap-2">{t("noAttempts")}</CardTitle>
          <CardDescription className="mt-2">
            <Link
              href="/guru/kelas"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              Ke Kelas Saya
            </Link>
          </CardDescription>
        </Card>
      ) : null}

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>{t("avgPerQuiz")}</CardTitle>
          {summary.quizAvgScores.length === 0 ? (
            <CardDescription className="mt-3">{t("noAttempts")}</CardDescription>
          ) : (
            <div className="mt-4 space-y-4">
              {summary.quizAvgScores.map((q) => (
                <div key={q.quizId}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate font-semibold" title={q.quizTitle}>
                      {normalizeKuisSpelling(q.quizTitle)}
                    </span>
                    <span className="shrink-0 font-display font-bold text-primary">
                      {q.avgScore}%{" "}
                      <span className="text-xs font-normal text-muted">
                        ({t("attemptCount", { count: q.attemptCount })})
                      </span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-primary/10">
                    <div
                      className={`h-full rounded-full ${q.avgScore >= 80 ? "bg-green-500" : q.avgScore >= 60 ? "bg-secondary" : "bg-red-400"}`}
                      style={{ width: `${Math.min(q.avgScore, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle>{t("histogramTitle")}</CardTitle>
          <CardDescription>{t("histogramDesc")}</CardDescription>
          {totalAttempts === 0 ? (
            <CardDescription className="mt-3">{t("noAttempts")}</CardDescription>
          ) : (
            <div className="mt-6 flex h-48 items-end justify-center gap-8">
              {histogramBuckets.map((b) => (
                <div key={b.key} className="flex w-20 flex-col items-center gap-2">
                  <span className="font-display text-lg font-bold text-foreground">
                    {b.value}
                  </span>
                  <div
                    className={`w-full rounded-t-2xl ${b.color}`}
                    style={{ height: `${Math.max((b.value / histogramMax) * 140, 4)}px` }}
                  />
                  <span className="text-center text-xs text-muted">{t(b.key)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mb-8">
        <CardTitle>{t("weeklyTrendTitle")}</CardTitle>
        {summary.weeklyTrend.every((w) => w.attemptCount === 0) ? (
          <CardDescription className="mt-3">{t("noAttempts")}</CardDescription>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <div className="flex min-w-[480px] items-end gap-3" style={{ height: "180px" }}>
              {summary.weeklyTrend.map((w) => (
                <div key={w.weekStart.toISOString()} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-bold text-foreground">{w.attemptCount}</span>
                  <div
                    className="w-full max-w-12 rounded-t-xl bg-primary"
                    style={{
                      height: `${Math.max((w.attemptCount / trendMax) * 120, 4)}px`,
                    }}
                  />
                  <span className="whitespace-nowrap text-[11px] text-muted">
                    {formatWeekLabel(w.weekStart, locale)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="mb-8 border-red-200/60">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          {t("hardestQuestions")}
        </CardTitle>
        {summary.hardestQuestions.length === 0 ? (
          <CardDescription className="mt-3">{t("noQuestionData")}</CardDescription>
        ) : (
          <ul className="mt-4 space-y-3">
            {summary.hardestQuestions.slice(0, 5).map((q, idx) => (
              <li
                key={q.questionId}
                className="rounded-2xl border border-primary/10 bg-white/70 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">
                    <span className="mr-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/20 font-display text-xs font-bold text-secondary">
                      {idx + 1}
                    </span>
                    {q.questionText}
                  </p>
                  <Badge variant="primary" className="shrink-0">
                    {t("errorRate", {
                      rate: q.errorRate,
                      wrong: q.wrongCount,
                      total: q.totalAnswers,
                    })}
                  </Badge>
                </div>
                <p className="mt-1 pl-8 text-xs text-muted">
                  {normalizeKuisSpelling(q.quizTitle)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-red-500" />
            {t("studentsNotPassedTitle")}
          </CardTitle>
          {studentsNotPassed.length === 0 ? (
            <CardDescription className="mt-3">{t("allPassed")}</CardDescription>
          ) : (
            <ul className="mt-4 max-h-96 divide-y divide-primary/10 overflow-y-auto">
              {studentsNotPassed.slice(0, 30).map((s) => (
                <li key={`${s.studentId}:${s.quizId}`} className="py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/guru/siswa/${s.studentId}`}
                      className="truncate font-semibold text-primary hover:underline"
                    >
                      {s.studentName}
                    </Link>
                    <Badge variant="secondary">{t("bestScore", { score: s.bestScore })}</Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {normalizeKuisSpelling(s.quizTitle)} · {s.classTitle}
                    {s.lastAttemptAt
                      ? ` · (${formatDateTime(s.lastAttemptAt, locale)})`
                      : ""}
                  </p>
                </li>
              ))}
              {studentsNotPassed.length > 30 ? (
                <li className="py-2">
                  <p className="text-xs text-muted">
                    {t("showingOf", {
                      shown: 30,
                      total: studentsNotPassed.length,
                    })}
                  </p>
                </li>
              ) : null}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-secondary" />
            {t("studentsNotAttemptedTitle")}
          </CardTitle>
          {studentsNotAttempted.length === 0 ? (
            <CardDescription className="mt-3">{t("allAttempted")}</CardDescription>
          ) : (
            <ul className="mt-4 max-h-96 divide-y divide-primary/10 overflow-y-auto">
              {studentsNotAttempted.slice(0, 30).map((s) => (
                <li key={`${s.studentId}:${s.quizId}`} className="py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/guru/siswa/${s.studentId}`}
                      className="truncate font-semibold text-primary hover:underline"
                    >
                      {s.studentName}
                    </Link>
                    <span className="shrink-0 text-xs text-muted">{s.classTitle}</span>
                  </div>
                  <p className="text-xs text-muted">{normalizeKuisSpelling(s.quizTitle)}</p>
                </li>
              ))}
              {studentsNotAttempted.length > 30 ? (
                <li className="py-2">
                  <p className="text-xs text-muted">
                    {t("showingOf", {
                      shown: 30,
                      total: studentsNotAttempted.length,
                    })}
                  </p>
                </li>
              ) : null}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-tertiary" />
          {t("materialStatsTitle")}
        </CardTitle>
        {materialStats.length === 0 ? (
          <CardDescription className="mt-3">{t("noMaterials")}</CardDescription>
        ) : (
          <div className="mt-4 space-y-4">
            {materialStats.map((m) => (
              <div key={m.materialId}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate font-semibold" title={m.materialTitle}>
                    {m.materialTitle}
                    <span className="ml-2 text-xs font-normal text-muted">{m.classTitle}</span>
                  </span>
                  <span className="shrink-0 font-display font-bold text-tertiary">
                    {m.completionRate}%{" "}
                    <span className="text-xs font-normal text-muted">
                      ({m.completedCount}/{m.enrolledCount})
                    </span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-tertiary/10">
                  <div
                    className="h-full rounded-full bg-tertiary"
                    style={{ width: `${Math.min(m.completionRate, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
