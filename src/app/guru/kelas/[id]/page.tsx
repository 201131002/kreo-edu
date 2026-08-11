import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FlashAlert } from "@/components/guru/flash-alert";
import { GuruBreadcrumb } from "@/components/guru/breadcrumb";
import { ClassTabs } from "@/components/guru/class-tabs";
import { AddMaterialForm } from "@/components/guru/add-material-form";
import { CreateQuizForm } from "@/components/guru/create-quiz-form";
import { EditClassPanel } from "@/components/guru/edit-class-panel";
import { MaterialRow } from "@/components/guru/material-row";
import { QuizRow } from "@/components/guru/quiz-row";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Gamepad2, Users } from "lucide-react";

export default async function GuruClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string; tab?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const session = await auth();
  const t = await getTranslations("guru");
  const activeTab = sp.tab === "kuis" ? "kuis" : "materi";

  const classItem = await prisma.class.findFirst({
    where: { id, teacherId: session!.user.id },
    include: {
      materials: { orderBy: { createdAt: "desc" } },
      quizzes: {
        include: { _count: { select: { questions: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!classItem) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <GuruBreadcrumb
        items={[
          { label: t("classes.title"), href: "/guru/kelas" },
          { label: classItem.title },
        ]}
      />

      <FlashAlert success={sp.success} error={sp.error} />

      <EditClassPanel
        classId={id}
        title={classItem.title}
        description={classItem.description}
      />

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">{classItem.title}</h1>
        {classItem.description && (
          <p className="mt-2 text-muted">{classItem.description}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <Badge variant="primary" className="gap-1">
            <Users className="h-3.5 w-3.5" />
            {classItem._count.enrollments} siswa
          </Badge>
          <Badge variant="tertiary" className="gap-1">
            <FileText className="h-3.5 w-3.5" />
            {classItem.materials.length} materi
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Gamepad2 className="h-3.5 w-3.5" />
            {classItem.quizzes.length} kuis
          </Badge>
        </div>
      </div>

      <ClassTabs classId={id} activeTab={activeTab} />

      {activeTab === "materi" && (
        <div className="space-y-6">
          <Card>
            <CardTitle className="text-base">Tambah Materi Baru</CardTitle>
            <CardDescription className="mb-4">
              Materi akan tampil di halaman belajar siswa
            </CardDescription>
            <AddMaterialForm classId={id} />
          </Card>

          {classItem.materials.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
                Materi Tersimpan ({classItem.materials.length})
              </h2>
              <div className="space-y-3">
                {classItem.materials.map((m) => (
                  <MaterialRow key={m.id} material={m} classId={id} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "kuis" && (
        <div className="space-y-6">
          <Card>
            <CardTitle className="text-base">Buat Kuis Baru</CardTitle>
            <CardDescription className="mb-4">
              Setelah dibuat, kamu akan diarahkan untuk menambahkan soal
            </CardDescription>
            <CreateQuizForm classId={id} />
          </Card>

          {classItem.quizzes.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
                Kuis Tersimpan ({classItem.quizzes.length})
              </h2>
              <div className="space-y-3">
                {classItem.quizzes.map((q) => (
                  <QuizRow
                    key={q.id}
                    classId={id}
                    quiz={{
                      id: q.id,
                      title: q.title,
                      rewardExp: q.rewardExp,
                      rewardCoins: q.rewardCoins,
                      questionCount: q._count.questions,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}