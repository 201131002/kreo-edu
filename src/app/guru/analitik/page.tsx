import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { BarChart3, BookOpen, Users, Zap } from "lucide-react";
import { redirect } from "next/navigation";

export default async function GuruAnalitikPage() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") {
    redirect("/dashboard/guru?error=unauthorized");
  }

  const t = await getTranslations("guru.analytics");
  const teacherId = session.user.id;

  const [classCount, studentCount, quizCount, attemptStats] = await Promise.all([
    prisma.class.count({ where: { teacherId } }),
    prisma.classEnrollment.count({ where: { class: { teacherId } } }),
    prisma.quiz.count({ where: { class: { teacherId } } }),
    prisma.quizAttempt.aggregate({
      where: { quiz: { class: { teacherId } } },
      _count: { id: true },
      _avg: { score: true },
    }),
  ]);

  const stats = [
    { label: t("myClasses"), value: classCount, icon: BookOpen },
    { label: t("enrolledStudents"), value: studentCount, icon: Users },
    { label: t("totalQuizzes"), value: quizCount, icon: Zap },
    { label: t("completedQuizzes"), value: attemptStats._count.id, icon: BarChart3 },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader title={t("title")} description={t("description")} />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <Card>
        <CardTitle>{t("avgScoreTitle")}</CardTitle>
        <p className="mt-2 font-display text-4xl font-bold text-primary">
          {Math.round(attemptStats._avg.score ?? 0)}%
        </p>
        <CardDescription className="mt-2">
          {t("avgScoreDesc", { count: attemptStats._count.id })}
        </CardDescription>
      </Card>
    </div>
  );
}