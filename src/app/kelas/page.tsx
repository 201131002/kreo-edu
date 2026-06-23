import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enrollClassAction } from "@/actions/class";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export default async function KelasPage() {
  const session = await auth();
  const isStudent = session?.user.role === "SISWA";

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
            return (
              <Card key={cls.id} className="flex flex-col">
                <Badge variant="primary" className="mb-3 w-fit">
                  {cls._count.quizzes} Kuis
                </Badge>
                <CardTitle>{cls.title}</CardTitle>
                <CardDescription>
                  {cls.description ?? "Petualangan belajar menanti!"}
                </CardDescription>
                <p className="mt-2 text-xs text-muted">
                  Guru: {cls.teacher.nama} · {cls._count.materials} materi
                </p>
                <div className="mt-auto flex gap-2 pt-4">
                  {enrolled ? (
                    <>
                      <Link href={`/kelas/${cls.id}/materi`} className="flex-1">
                        <Button className="w-full" size="sm">
                          Buka Materi
                        </Button>
                      </Link>
                    </>
                  ) : isStudent ? (
                    <form action={enrollClassAction} className="w-full">
                      <input type="hidden" name="classId" value={cls.id} />
                      <Button type="submit" className="w-full" size="sm" variant="secondary">
                        Gabung Kelas
                      </Button>
                    </form>
                  ) : (
                    <Link href={`/kelas/${cls.id}/materi`} className="w-full">
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