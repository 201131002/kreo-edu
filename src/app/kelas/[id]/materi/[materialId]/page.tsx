import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markMaterialCompleteAction } from "@/actions/class";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlashAlert } from "@/components/guru/flash-alert";
import { MediaRenderer } from "@/components/media/media-renderer";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
} from "lucide-react";

export default async function MaterialDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; materialId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { id, materialId } = await params;
  const sp = await searchParams;
  const session = await auth();
  const isSiswa = session?.user.role === "SISWA";

  const material = await prisma.material.findFirst({
    where: { id: materialId, classId: id },
    include: {
      media: { orderBy: { order: "asc" } },
      class: { select: { title: true } },
    },
  });

  if (!material) notFound();

  // Progress & navigasi antar materi (khusus siswa ter-enroll)
  const enrolled = isSiswa
    ? (await prisma.classEnrollment.findUnique({
        where: {
          classId_studentId: { classId: id, studentId: session!.user.id },
        },
      })) !== null
    : false;

  const siblings = await prisma.material.findMany({
    where: { classId: id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });
  const idx = siblings.findIndex((m) => m.id === materialId);
  const prevMaterial = idx > 0 ? siblings[idx - 1] : null;
  const nextMaterial =
    idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  let completed = false;
  if (isSiswa) {
    const progress = await prisma.materialProgress.findUnique({
      where: {
        materialId_studentId: { materialId, studentId: session!.user.id },
      },
    });
    completed = progress?.status === "COMPLETED";
  }

  // Kuis di kelas ini untuk CTA di bawah materi
  const quizzes = await prisma.quiz.findMany({
    where: { classId: id },
    include: { _count: { select: { questions: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href={`/kelas/${id}/materi`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar materi
      </Link>

      <FlashAlert success={sp.success} error={sp.error} />

      <PageHeader title={material.title} description={material.class.title} />

      <Card>
        <CardDescription className="whitespace-pre-wrap text-base leading-relaxed">
          {material.content ?? "Materi interaktif menanti!"}
        </CardDescription>

        {material.media.length > 0 && (
          <div className="mt-6 space-y-5">
            {material.media.map((media) => (
              <MediaRenderer key={media.id} media={media} />
            ))}
          </div>
        )}

        {material.fileUrl && (
          <a
            href={material.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Unduh File Materi
          </a>
        )}
      </Card>

      {isSiswa && (
        <form action={markMaterialCompleteAction} className="mt-6">
          <input type="hidden" name="classId" value={id} />
          <input type="hidden" name="materialId" value={materialId} />
          <Button type="submit" variant={completed ? "outline" : "primary"}>
            {completed ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                Materi Selesai Dibaca
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Tandai Selesai Dibaca
              </>
            )}
          </Button>
        </form>
      )}

      <nav className="mt-8 flex items-stretch justify-between gap-3">
        {prevMaterial ? (
          <Link href={`/kelas/${id}/materi/${prevMaterial.id}`} className="flex-1">
            <Button variant="outline" className="h-full w-full justify-start">
              <ChevronLeft className="mr-1 h-4 w-4 shrink-0" />
              <span className="truncate">{prevMaterial.title}</span>
            </Button>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {nextMaterial ? (
          <Link href={`/kelas/${id}/materi/${nextMaterial.id}`} className="flex-1">
            <Button variant="outline" className="h-full w-full justify-end">
              <span className="truncate">{nextMaterial.title}</span>
              <ChevronRight className="ml-1 h-4 w-4 shrink-0" />
            </Button>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </nav>

      {quizzes.length > 0 && isSiswa && (
        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
            <Gamepad2 className="h-6 w-6 text-tertiary" /> Uji Pemahamanmu
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <div className="flex items-start gap-3">
                  <Gamepad2 className="mt-0.5 h-5 w-5 shrink-0 text-tertiary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{quiz.title}</p>
                    <CardDescription>
                      {quiz._count.questions} soal · +{quiz.rewardExp} EXP · +
                      {quiz.rewardCoins} Koin
                    </CardDescription>
                  </div>
                  <Link href={`/kelas/${id}/kuis/${quiz.id}`}>
                    <Button size="sm" variant="tertiary">
                      Mulai
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}