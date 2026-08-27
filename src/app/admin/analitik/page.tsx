export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  getAdminAnalyticsSummary,
  parseAdminAnalyticsFilters,
} from "@/lib/admin-analytics";
import { normalizeKuisSpelling } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Crown,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";

function formatWeekLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function buildAdminExportQuery(from?: string, to?: string): string {
  const search = new URLSearchParams();
  if (from) search.set("from", from);
  if (to) search.set("to", to);
  const str = search.toString();
  return str ? `?${str}` : "";
}

export default async function AdminAnalitikPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard/admin?error=unauthorized");
  }

  const locale = await getLocale();
  const t = await getTranslations("admin.analytics");
  const sp = await searchParams;
  const filters = parseAdminAnalyticsFilters(sp);
  const summary = await getAdminAnalyticsSummary(filters);

  const growthMax = Math.max(
    ...summary.weeklyGrowth.map((w) => Math.max(w.newUsers, w.newAttempts)),
    1
  );

  const stats = [
    { label: t("totalUsers"), value: summary.totalUsers, icon: Users },
    { label: t("totalClasses"), value: summary.totalClasses, icon: BookOpen },
    { label: t("totalQuizzes"), value: summary.totalQuizzes, icon: Zap },
    { label: t("completedQuizzes"), value: summary.totalAttempts, icon: BarChart3 },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader title={t("title")} description={t("description")} />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="text-center">
          <UserCheck className="mx-auto mb-2 h-8 w-8 text-green-600" />
          <p className="font-display text-3xl font-bold text-tertiary">
            {summary.activeUsers7d}
          </p>
          <CardDescription>{t("activeUsers7d")}</CardDescription>
        </Card>
        <Card className="text-center">
          <Activity className="mx-auto mb-2 h-8 w-8 text-green-600" />
          <p className="font-display text-3xl font-bold text-tertiary">
            {summary.activeUsers30d}
          </p>
          <CardDescription>{t("activeUsers30d")}</CardDescription>
        </Card>
        <Card className="text-center">
          <Crown className="mx-auto mb-2 h-8 w-8 text-secondary" />
          <p className="font-display text-3xl font-bold text-primary">
            {summary.roleCounts.GURU}
          </p>
          <CardDescription>{t("roleGuru")}</CardDescription>
        </Card>
        <Card className="text-center">
          <Trophy className="mx-auto mb-2 h-8 w-8 text-tertiary" />
          <p className="font-display text-4xl font-bold text-primary">
            {summary.avgScore}%
          </p>
          <CardDescription>{t("avgScoreDesc", { count: summary.totalAttempts })}</CardDescription>
        </Card>
      </div>

      <Card className="mb-8">
        <CardTitle>{t("filterTitle")}</CardTitle>
        <form method="get" className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <Label htmlFor="from">{t("fromDate")}</Label>
            <Input id="from" name="from" type="date" defaultValue={sp.from ?? ""} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="to">{t("toDate")}</Label>
            <Input id="to" name="to" type="date" defaultValue={sp.to ?? ""} className="mt-1" />
          </div>
          <Button type="submit" size="sm">{t("applyFilter")}</Button>
          <Link href="/admin/analitik">
            <Button type="button" variant="outline" size="sm">{t("resetFilter")}</Button>
          </Link>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={`/api/admin/analitik/export/excel${buildAdminExportQuery(sp.from, sp.to)}`}
            download
          >
            <Button type="button" variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4" />
              {t("exportExcel")}
            </Button>
          </a>
          <a
            href={`/api/admin/analitik/export/pdf${buildAdminExportQuery(sp.from, sp.to)}`}
            download
          >
            <Button type="button" variant="outline" size="sm">
              <FileText className="h-4 w-4" />
              {t("exportPdf")}
            </Button>
          </a>
        </div>
      </Card>

      <Card className="mb-8">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {t("growthTitle")}
        </CardTitle>
        {summary.weeklyGrowth.every((w) => w.newUsers === 0 && w.newAttempts === 0) ? (
          <CardDescription className="mt-3">{t("noData")}</CardDescription>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-primary/10 text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-4">{t("colWeek")}</th>
                  <th className="py-2 pr-4 text-right">{t("colNewUsers")}</th>
                  <th className="py-2 pr-4 text-right">{t("colNewAttempts")}</th>
                </tr>
              </thead>
              <tbody>
                {summary.weeklyGrowth.map((w) => (
                  <tr key={w.weekStart.toISOString()} className="border-b border-primary/5 last:border-0">
                    <td className="py-2.5 pr-4 font-semibold">
                      {formatWeekLabel(w.weekStart, locale)}
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-primary/10 max-sm:hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${(w.newUsers / growthMax) * 100}%` }}
                          />
                        </div>
                        {w.newUsers}
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-tertiary/10 max-sm:hidden">
                          <div
                            className="h-full rounded-full bg-tertiary"
                            style={{ width: `${(w.newAttempts / growthMax) * 100}%` }}
                          />
                        </div>
                        {w.newAttempts}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>{t("classRankingTitle")}</CardTitle>
          {summary.classRanking.length === 0 ? (
            <CardDescription className="mt-3">{t("noData")}</CardDescription>
          ) : (
            <ol className="mt-4 space-y-3">
              {summary.classRanking.slice(0, 5).map((c, idx) => (
                <li
                  key={c.classId}
                  className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white/70 px-4 py-3"
                >
                  <span
                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${
                      idx === 0
                        ? "bg-secondary/25 text-secondary"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.classTitle}</p>
                    <p className="text-xs text-muted">
                      {c.teacherName} ·{" "}
                      {t("classMeta", {
                        students: c.studentCount,
                        attempts: c.attemptCount,
                      })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {c.avgScore}%
                  </Badge>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {t("hardestQuestionsTitle")}
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
                      <span className="mr-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-display text-xs font-bold text-red-500">
                        {idx + 1}
                      </span>
                      {q.questionText}
                    </p>
                    <Badge variant="primary" className="shrink-0">
                      {q.errorRate}%
                    </Badge>
                  </div>
                  <p className="mt-1 pl-8 text-xs text-muted">
                    {normalizeKuisSpelling(q.quizTitle)} · {q.wrongCount}/{q.totalAnswers}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardTitle>{t("roleDistTitle")}</CardTitle>
        <div className="mt-4 flex h-4 overflow-hidden rounded-full">
          <div
            className="bg-tertiary"
            style={{
              width: `${(summary.roleCounts.SISWA / Math.max(summary.totalUsers, 1)) * 100}%`,
            }}
            title={`${t("roleSiswa")}: ${summary.roleCounts.SISWA}`}
          />
          <div
            className="bg-secondary"
            style={{
              width: `${(summary.roleCounts.GURU / Math.max(summary.totalUsers, 1)) * 100}%`,
            }}
            title={`${t("roleGuru")}: ${summary.roleCounts.GURU}`}
          />
          <div
            className="bg-primary"
            style={{
              width: `${(summary.roleCounts.ADMIN / Math.max(summary.totalUsers, 1)) * 100}%`,
            }}
            title={`${t("roleAdmin")}: ${summary.roleCounts.ADMIN}`}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-tertiary" />
            {t("roleSiswa")}: <strong>{summary.roleCounts.SISWA}</strong>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-secondary" />
            {t("roleGuru")}: <strong>{summary.roleCounts.GURU}</strong>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary" />
            {t("roleAdmin")}: <strong>{summary.roleCounts.ADMIN}</strong>
          </span>
        </div>
      </Card>
    </div>
  );
}
