import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Gamepad2 } from "lucide-react";

export default async function MateriPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const classItem = await prisma.class.findUnique({
    where: { id },
    include: {
      materials: { orderBy: { createdAt: "desc" } },
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
        <h2 className="mb-4 font-display text-2xl font-bold">📚 Materi Pembelajaran</h2>
        {classItem.materials.length === 0 ? (
          <Card>
            <CardDescription>Belum ada materi untuk kelas ini.</CardDescription>
          </Card>
        ) : (
          <div className="grid gap-4">
            {classItem.materials.map((material) => (
              <Card key={material.id}>
                <div className="flex items-start gap-4">
                  <FileText className="mt-1 h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <CardTitle>{material.title}</CardTitle>
                    <CardDescription className="mt-2 whitespace-pre-wrap">
                      {material.content ?? "Materi interaktif menanti!"}
                    </CardDescription>
                    {material.fileUrl && (
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
                      >
                        Unduh File Materi
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">🎮 Kuis Seru</h2>
        {classItem.quizzes.length === 0 ? (
          <Card>
            <CardDescription>Belum ada kuis untuk kelas ini.</CardDescription>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {classItem.quizzes.map((quiz) => (
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
                  <Badge variant="tertiary">{quiz._count.questions} Soal</Badge>
                </div>
                {quiz._count.questions > 0 && (
                  <Link href={`/kelas/${id}/kuis/${quiz.id}`} className="mt-4 inline-block">
                    <Button size="sm">Mulai Kuis</Button>
                  </Link>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}