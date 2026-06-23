import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { FlashAlert } from "@/components/guru/flash-alert";
import { CreateClassForm } from "@/components/guru/create-class-form";
import { ClassCard } from "@/components/guru/class-card";
import { Card, CardDescription } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default async function GuruKelasPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;

  const classes = await prisma.class.findMany({
    where: { teacherId: session!.user.id },
    include: {
      _count: { select: { enrollments: true, materials: true, quizzes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Kelas Saya"
        description="Buat kelas, lalu kelola materi dan kuis di dalamnya."
      />

      <FlashAlert success={sp.success} error={sp.error} />

      <div className="mb-10">
        <CreateClassForm />
      </div>

      {classes.length === 0 ? (
        <Card className="py-12 text-center">
          <BookOpen className="mx-auto mb-3 h-12 w-12 text-muted" />
          <CardDescription className="text-base">
            Belum ada kelas. Buat kelas pertamamu di atas untuk memulai!
          </CardDescription>
        </Card>
      ) : (
        <>
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">
            {classes.length} Kelas Aktif
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