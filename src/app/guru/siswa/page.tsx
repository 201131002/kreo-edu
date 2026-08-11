import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { formatDate } from "@/lib/format-date";
import { PageHeader } from "@/components/layout/page-header";
import { GuruStudentFilters } from "@/components/guru/guru-student-filters";
import {
  GuruStudentPagination,
  GURU_STUDENT_PAGE_SIZE,
} from "@/components/guru/guru-student-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default async function GuruSiswaPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; page?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations("guru.students");
  const tc = await getTranslations("common");
  const teacherId = session!.user.id;
  const currentPage = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const classes = await prisma.class.findMany({
    where: { teacherId },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  const validClassIds = new Set(classes.map((c) => c.id));
  const classId =
    sp.classId && sp.classId !== "all" && validClassIds.has(sp.classId)
      ? sp.classId
      : "all";

  const enrollmentWhere = {
    class: { teacherId },
    ...(classId !== "all" ? { classId } : {}),
  };

  const [enrollmentCounts, totalCount, enrollments] = await Promise.all([
    prisma.classEnrollment.groupBy({
      by: ["classId"],
      where: { class: { teacherId } },
      _count: { id: true },
    }),
    prisma.classEnrollment.count({ where: enrollmentWhere }),
    prisma.classEnrollment.findMany({
      where: enrollmentWhere,
      include: {
        student: {
          select: {
            nama: true,
            email: true,
            studentProfile: {
              select: { currentLevel: true, currentExp: true },
            },
          },
        },
        class: { select: { id: true, title: true } },
      },
      orderBy: [{ class: { title: "asc" } }, { student: { nama: "asc" } }],
      skip: (currentPage - 1) * GURU_STUDENT_PAGE_SIZE,
      take: GURU_STUDENT_PAGE_SIZE,
    }),
  ]);

  const counts: Record<string, number> = {
    all: enrollmentCounts.reduce((sum, row) => sum + row._count.id, 0),
  };
  for (const row of enrollmentCounts) {
    counts[row.classId] = row._count.id;
  }

  const showingFrom =
    totalCount === 0 ? 0 : (currentPage - 1) * GURU_STUDENT_PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * GURU_STUDENT_PAGE_SIZE, totalCount);
  const className =
    classId !== "all" ? classes.find((c) => c.id === classId)?.title : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader title={t("title")} description={t("description")} />

      <GuruStudentFilters
        classes={classes}
        currentClassId={classId}
        counts={counts}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <p>
          {tc("showingRange", { from: showingFrom, to: showingTo, total: totalCount })}
          {className ? t("inClass", { className }) : ""}
        </p>
        {totalCount > 0 && (
          <p>
            {tc("pageOf", {
              page: currentPage,
              total: Math.max(1, Math.ceil(totalCount / GURU_STUDENT_PAGE_SIZE)),
            })}
          </p>
        )}
      </div>

      {enrollments.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("title")}
          description={
            classId === "all" ? t("noStudentsAll") : t("noStudentsClass")
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-primary/10 bg-white/80 shadow-soft">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-primary/10 bg-primary/5 text-xs font-bold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">{t("name")}</th>
                <th className="px-4 py-3">{t("email")}</th>
                <th className="px-4 py-3">{t("class")}</th>
                <th className="px-4 py-3">{t("level")}</th>
                <th className="px-4 py-3">{t("exp")}</th>
                <th className="px-4 py-3">{t("joined")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id} className="transition hover:bg-primary/5">
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {enrollment.student.nama}
                  </td>
                  <td className="px-4 py-3 text-muted">{enrollment.student.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="primary">{enrollment.class.title}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {enrollment.student.studentProfile?.currentLevel ?? 1}
                  </td>
                  <td className="px-4 py-3 text-tertiary">
                    {enrollment.student.studentProfile?.currentExp ?? 0}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatDate(enrollment.joinedAt, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <GuruStudentPagination
        currentPage={currentPage}
        totalCount={totalCount}
        classId={classId}
      />
    </div>
  );
}