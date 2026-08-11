import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { SymmetricMenuGrid } from "@/components/dashboard/symmetric-menu-grid";
import { BarChart3, BookOpen, HelpCircle, Library, Users } from "lucide-react";

export default async function TeacherDashboard() {
  const session = await auth();
  const t = await getTranslations("dashboard.guru");
  const tc = await getTranslations("common");

  const teacherId = session!.user.id;

  const [classCount, studentCount, quizCount] = await Promise.all([
    prisma.class.count({ where: { teacherId } }),
    prisma.classEnrollment.count({ where: { class: { teacherId } } }),
    prisma.quiz.count({ where: { class: { teacherId } } }),
  ]);

  const links = [
    {
      href: "/guru/kelas",
      title: t("myClasses"),
      description: t("myClassesDesc", { classCount, quizCount }),
      icon: BookOpen,
      iconClassName: "text-tertiary",
    },
    {
      href: "/guru/bank-soal",
      title: t("questionBank"),
      description: t("questionBankDesc"),
      icon: Library,
      iconClassName: "text-tertiary",
    },
    {
      href: "/guru/siswa",
      title: t("studentsProgress"),
      description: t("studentsProgressDesc", { count: studentCount }),
      icon: Users,
      iconClassName: "text-tertiary",
    },
    {
      href: "/guru/analitik",
      title: t("quizAnalytics"),
      description: t("quizAnalyticsDesc"),
      icon: BarChart3,
      iconClassName: "text-tertiary",
    },
    {
      href: "/bantuan",
      title: t("help"),
      description: t("helpDesc"),
      icon: HelpCircle,
      iconClassName: "text-tertiary",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title={t("title", { name: session!.user.nama })}
        description={t("description")}
      />

      <SymmetricMenuGrid
        items={links}
        columns={2}
        buttonLabel={tc("open")}
        buttonVariant="tertiary"
      />
    </div>
  );
}