export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { GuruBreadcrumb } from "@/components/guru/breadcrumb";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format-date";
import { normalizeKuisSpelling } from "@/lib/utils";
import { PASS_THRESHOLD } from "@/lib/guru-analytics";
import { ArrowLeft, BookOpen, ClipboardList, Star } from "lucide-react";

export default async function GuruStudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "GURU") {
    notFound();
  }

  const { studentId } = await params;
  const teacherId = session.user.id;
  const locale = await getLocale();
  const t = await getTranslations("guru.studentDetail");
  const ta = await getTranslations("guru.analytics");

  const enrollment = await prisma.classEnrollment.findFirst({
    where: { studentId, class: { teacherId } },
    include: {
      student: {
        select: {
          nama: true,
          email: true,
          createdAt: true,
          studentProfile: {
            select: { currentLevel: true, currentExp: true },
          },
        },
      },
      class: { select: { id: true, title: true } },
    },
  });

  if (!enrollment) notFound();

  const [attempts, materialProgress, quizCountInClasses] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { studentId, quiz: { class: { teacherId } } },
      include: { quiz: { include: { class: { select: { title: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.materialProgress.findMany({
      where: { studentId, material: { class: { teacherId } } },
      include: {
        material: {
          select: { title: true, class: { select: { title: true } } },
        },
      },
    }),
    prisma.quiz.count({ where: { class: { teacherId } } }),
  ]);

  const bestByQuiz = new Map<string, number>();
  for (const a of attempts) {
    const current = bestByQuiz.get(a.quizId);
    if (current === undefined || a.score > current) {
      bestByQuiz.set(a.quizId, a.score);
    }
  }
  const quizzesPassed = [...bestByQuiz.values()].filter(
    (score) => score >= PASS_THRESHOLD
  ).length;
  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((acc, a) => acc + a.score, 0) / attempts.length)
      : 0;

  const completedMaterials = materialProgress.filter(
    (p) => p.status === "COMPLETED"
  ).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <GuruBreadcrumb
        items={[
          { label: "Kelas Saya", href: "/guru/kelas" },
          { label: t("studentsTitle"), href: "/guru/siswa" },
          { label: enrollment.student.nama },
        ]}
      />

      <PageHeader title={enrollment.student.nama} description={enrollment.student.email} />

      <div className="mb-4">
        <Link href="/guru/siswa">
          <span className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            {t("backToStudents")}
          </span>
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="text-center">
          <Star className="mx-auto mb-2 h-8 w-8 text-secondary" />
          <p className="font-display text-3xl font-bold text-tertiary">{avgScore}%</p>
          <CardDescription>{t("avgScore")}</CardDescription>
        </Card>
        <Card className="text-center">
          <ClipboardList className="mx-auto mb-2 h-8 w-8 text-primary" />
          <p className="font-display text-3xl font-bold text-tertiary">
            {quizzesPassed}/{quizCountInClasses}
          </p>
          <CardDescription>
            {t("quizzesPassed", { threshold: PASS_THRESHOLD })}
          </CardDescription>
        </Card>
        <Card className="text-center">
          <BookOpen className="mx-auto mb-2 h-8 w-8 text-green-600" />
          <p className="font-display text-3xl font-bold text-tertiary">
            {completedMaterials}
          </p>
          <CardDescription>{t("materialsCompleted")}</CardDescription>
        </Card>
        <Card className="text-center">
          <Badge variant="secondary" className="mt-2 font-display text-xl">
            Lv. {enrollment.student.studentProfile?.currentLevel ?? 1}
          </Badge>
          <CardDescription className="mt-2">{t("levelLabel")}</CardDescription>
        </Card>
      </div>

      <Card className="mb-8">
        <CardTitle>{t("quizHistoryTitle")}</CardTitle>
        {attempts.length === 0 ? (
          <CardDescription className="mt-3">{ta("noAttempts")}</CardDescription>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary/10 text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-4">{t("colQuiz")}</th>
                  <th className="py-2 pr-4">{t("colClass")}</th>
                  <th className="py-2 pr-4">{t("colDate")}</th>
                  <th className="py-2 pr-4 text-right">{t("colScore")}</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id} className="border-b border-primary/5 last:border-0">
                    <td className="py-2.5 pr-4 font-semibold">
                      {normalizeKuisSpelling(a.quiz.title)}
                    </td>
                    <td className="py-2.5 pr-4 text-muted">{a.quiz.class.title}</td>
                    <td className="py-2.5 pr-4 text-muted">
                      {formatDateTime(a.createdAt, locale)}
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      <Badge
                        variant={
                          a.score >= 80
                            ? "success"
                            : a.score >= 60
                              ? "secondary"
                              : "primary"
                        }
                      >
                        {a.score}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>{t("materialProgressTitle")}</CardTitle>
        {materialProgress.length === 0 ? (
          <CardDescription className="mt-3">{t("noMaterialProgress")}</CardDescription>
        ) : (
          <ul className="mt-4 divide-y divide-primary/10">
            {materialProgress.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.material.title}</p>
                  <p className="text-xs text-muted">{p.material.class.title}</p>
                </div>
                <Badge
                  variant={
                    p.status === "COMPLETED"
                      ? "success"
                      : p.status === "IN_PROGRESS"
                        ? "secondary"
                        : "primary"
                  }
                >
                  {t(`status.${p.status}`)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
