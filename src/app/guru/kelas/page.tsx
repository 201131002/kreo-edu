import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { FlashAlert } from "@/components/guru/flash-alert";
import { CreateClassForm } from "@/components/guru/create-class-form";
import { ClassCard } from "@/components/guru/class-card";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen } from "lucide-react";

export default async function GuruKelasPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const t = await getTranslations("guru.classes");

  const classes = await prisma.class.findMany({
    where: { teacherId: session!.user.id },
    include: {
      _count: { select: { enrollments: true, materials: true, quizzes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader title={t("title")} description={t("description")} />

      <FlashAlert success={sp.success} error={sp.error} />

      <div className="mb-10">
        <CreateClassForm />
      </div>

      {classes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t("title")}
          description={t("noClasses")}
        />
      ) : (
        <>
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">
            {t("activeCount", { count: classes.length })}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <ClassCard
                key={cls.id}
                id={cls.id}
                title={cls.title}
                description={cls.description}
                enrollments={cls._count.enrollments}
                materials={cls._count.materials}
                quizzes={cls._count.quizzes}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}