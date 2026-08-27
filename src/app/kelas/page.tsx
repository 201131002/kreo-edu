import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enrollClassAction } from "@/actions/class";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2 } from "lucide-react";

export default async function KelasPage() {
  const session = await auth();
  const isStudent = session?.user.role === "SISWA";

  // Progress baca materi per kelas untuk siswa yang login
  const completedByClass = new Map<string, number>();
  if (isStudent && session.user.id) {
    const progresses = await prisma.materialProgress.findMany({
      where: {
        studentId: session.user.id,
        status: "COMPLETED",
        material: { class: { enrollments: { some: { studentId: session.user.id } } } },
      },
      select: { materialId: true, material: { select: { classId: true } } },
    });
    for (const p of progresses) {
      completedByClass.set(p.material.classId, (completedByClass.get(p.material.classId) ?? 0) + 1);
    }
  }

  const classes = await prisma.class.findMany({
    include: {
      teacher: { select: { nama: true } },
      ...(isStudent
        ? { enrollments: { where: { studentId: session!.user.id } } }
        : {}),
      _count: { select: { materials: true, quizzes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Pilih Kelas Baru"
        description="Temukan petualangan belajar yang seru dan bergabunglah!"
      />

      {classes.length === 0 ? (
        <Card className="text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted" />
          <CardTitle>Belum Ada Kelas</CardTitle>
          <CardDescription>
            Guru belum membuat kelas. Cek kembali nanti!
          </CardDescription>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => {
            const enrolled =
              isStudent &&
              "enrollments" in cls &&
              cls.enrollments.length > 0;
            const totalMaterials = cls._count.materials;
            const completedMaterials = completedByClass.get(cls.id) ?? 0;
            const pct =
              totalMaterials > 0
                ? Math.round((completedMaterials / totalMaterials) * 100)
                : 0;
            const allRead = enrolled && totalMaterials > 0 && completedMaterials >= totalMaterials;
            return (
              <Card
                key={cls.id}
                className={`flex flex-col ${allRead ? "border-green-600/40" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      {enrolled ? (
                        allRead ? (
                          <Badge variant="success">
                            <CheckCircle2 className="h-3 w-3" /> Materi Selesai
                          </Badge>
                        ) : (
                          <Badge variant="primary">Sedang Dipelajari</Badge>
                        )
                      ) : (
                        <Badge variant="tertiary">Kelas Baru</Badge>
                      )}
                    </div>
                    <CardTitle className="leading-snug">{cls.title}</CardTitle>
                  </div>
                  {enrolled && totalMaterials > 0 && (
                    <div
                      className="relative h-12 w-12 shrink-0"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      title={`Materi dibaca: ${completedMaterials}/${totalMaterials}`}
                    >
                      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          className="text-muted"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeDasharray={`${pct} 100`}
                          pathLength={100}
                          className={`transition-all duration-500 ${allRead ? "text-green-600" : "text-primary"}`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums">
                        {pct}%
                      </span>
                    </div>
                  )}
                </div>

                <CardDescription className="mt-2 line-clamp-2">
                  {cls.description ?? "Petualangan belajar menanti!"}
                </CardDescription>

                <p className="mt-2 text-xs text-muted">
                  Guru: {cls.teacher.nama} · {totalMaterials} materi ·{" "}
                  {cls._count.quizzes} kuis
                </p>

                {enrolled && totalMaterials > 0 && !allRead && (
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Progress materi</span>
                      <span className="font-medium tabular-nums">
                        {completedMaterials}/{totalMaterials}
                      </span>
                    </div>
                    <div
                      className="h-2 w-full overflow-hidden rounded-full bg-muted"
                      title={`Materi dibaca: ${completedMaterials}/${totalMaterials}`}
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-4">
                  {enrolled ? (
                    <Link href={`/kelas/${cls.id}/materi`}>
                      <Button className="w-full" size="sm">
                        Buka Materi
                      </Button>
                    </Link>
                  ) : isStudent ? (
                    <form action={enrollClassAction}>
                      <input type="hidden" name="classId" value={cls.id} />
                      <Button type="submit" className="w-full" size="sm" variant="secondary">
                        Gabung Kelas
                      </Button>
                    </form>
                  ) : (
                    <Link href={`/kelas/${cls.id}/materi`}>
                      <Button className="w-full" size="sm" variant="outline">
                        Lihat
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}