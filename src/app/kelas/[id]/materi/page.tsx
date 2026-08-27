import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  Gamepad2,
  Image as ImageIcon,
  Music,
  Paperclip,
  RotateCcw,
} from "lucide-react";

export default async function MateriPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const isSiswa = session?.user.role === "SISWA";

  // Attempt kuis milik siswa yang sedang login di kelas ini
  let attemptsByQuiz = new Map<string, { bestScore: number; count: number }>();
  if (session?.user?.id) {
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        studentId: session.user.id,
        quiz: { classId: id },
      },
      select: { quizId: true, score: true },
    });
    attemptsByQuiz = new Map(
      attempts.reduce((acc, a) => {
        const prev = acc.get(a.quizId);
        acc.set(a.quizId, {
          bestScore: Math.max(prev?.bestScore ?? 0, a.score),
          count: (prev?.count ?? 0) + 1,
        });
        return acc;
      }, new Map<string, { bestScore: number; count: number }>())
    );
  }

  // Progress baca materi milik siswa yang sedang login
  let completedMaterialIds = new Set<string>();
  if (isSiswa && session.user.id) {
    const progresses = await prisma.materialProgress.findMany({
      where: { studentId: session.user.id, material: { classId: id } },
      select: { materialId: true, status: true },
    });
    completedMaterialIds = new Set(
      progresses.filter((p) => p.status === "COMPLETED").map((p) => p.materialId)
    );
  }

  // Verifikasi akses: siswa harus enrolled, guru harus pemilik, admin bebas
  if (session?.user.role === "SISWA") {
    const enrolled = await prisma.classEnrollment.findFirst({
      where: { classId: id, studentId: session.user.id },
    });
    if (!enrolled) notFound();
  } else if (session?.user.role === "GURU") {
    const ownsClass = await prisma.class.findFirst({
      where: { id, teacherId: session.user.id },
    });
    if (!ownsClass) notFound();
  } else if (!session) {
    notFound();
  }
  // ADMIN boleh akses semua kelas

  const classItem = await prisma.class.findUnique({
    where: { id },
    include: {
      materials: {
        orderBy: { createdAt: "desc" },
        include: { media: { select: { type: true } } },
      },
      quizzes: { include: { _count: { select: { questions: true } } } },
    },
  });

  if (!classItem) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title={classItem.title}
        description={classItem.description ?? "Materi dan kuis petualangan"}
      />

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-bold">
          <BookOpen className="h-6 w-6 text-primary" /> Materi Pembelajaran
        </h2>
        {classItem.materials.length === 0 ? (
          <Card>
            <CardDescription>Belum ada materi untuk kelas ini.</CardDescription>
          </Card>
        ) : (
          <div className="grid gap-4">
            {classItem.materials.map((material) => {
              const completed = completedMaterialIds.has(material.id);
              const counts = {
                image: material.media.filter((m) => m.type === "IMAGE").length,
                video: material.media.filter(
                  (m) => m.type === "VIDEO" || m.type === "EMBED"
                ).length,
                audio: material.media.filter((m) => m.type === "AUDIO").length,
                doc: material.media.filter(
                  (m) => m.type === "PDF" || m.type === "EBOOK"
                ).length,
              };
              return (
                <Link
                  key={material.id}
                  href={`/kelas/${id}/materi/${material.id}`}
                  className="group block"
                >
                  <Card className="transition-colors group-hover:border-primary/40">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle>{material.title}</CardTitle>
                          {isSiswa &&
                            (completed ? (
                              <Badge variant="success" className="shrink-0">
                                <CheckCircle2 className="h-3 w-3" /> Dibaca
                              </Badge>
                            ) : (
                              <Badge variant="tertiary" className="shrink-0">
                                Belum dibaca
                              </Badge>
                            ))}
                        </div>
                        <CardDescription className="mt-1.5 line-clamp-2">
                          {material.content ?? "Materi interaktif menanti!"}
                        </CardDescription>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {counts.image > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <ImageIcon className="h-3.5 w-3.5" /> {counts.image} gambar
                            </span>
                          )}
                          {counts.video > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Gamepad2 className="h-3.5 w-3.5" /> {counts.video} video
                            </span>
                          )}
                          {counts.audio > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Music className="h-3.5 w-3.5" /> {counts.audio} audio
                            </span>
                          )}
                          {counts.doc > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" /> {counts.doc} dokumen
                            </span>
                          )}
                          {material.fileUrl && (
                            <span className="inline-flex items-center gap-1">
                              <Paperclip className="h-3.5 w-3.5" /> lampiran file
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="mt-2 h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-bold">
          <Gamepad2 className="h-6 w-6 text-tertiary" /> Kuis Seru
        </h2>
        {classItem.quizzes.length === 0 ? (
          <Card>
            <CardDescription>Belum ada kuis untuk kelas ini.</CardDescription>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {classItem.quizzes.map((quiz) => {
              const attempt = attemptsByQuiz.get(quiz.id);
              return (
                <Card key={quiz.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Gamepad2 className="h-6 w-6 text-tertiary" />
                      <div>
                        <CardTitle>{quiz.title}</CardTitle>
                        <CardDescription>
                          {quiz._count.questions} soal · +{quiz.rewardExp} EXP · +{quiz.rewardCoins} Koin
                        </CardDescription>
                      </div>
                    </div>
                    {attempt ? (
                      <Badge variant="success">
                        <CheckCircle2 className="h-3 w-3" /> Selesai · {attempt.bestScore}
                      </Badge>
                    ) : (
                      <Badge variant="tertiary">{quiz._count.questions} Soal</Badge>
                    )}
                  </div>
                  {quiz._count.questions > 0 && (
                    <Link href={`/kelas/${id}/kuis/${quiz.id}`} className="mt-4 inline-block">
                      <Button size="sm" variant={attempt ? "outline" : "primary"}>
                        {attempt ? (
                          <>
                            <RotateCcw className="mr-1.5 h-4 w-4" /> Kerjakan Lagi
                          </>
                        ) : (
                          "Mulai Kuis"
                        )}
                      </Button>
                    </Link>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}