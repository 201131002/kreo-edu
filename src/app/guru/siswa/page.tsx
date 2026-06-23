import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function GuruSiswaPage() {
  const session = await auth();

  const enrollments = await prisma.classEnrollment.findMany({
    where: { class: { teacherId: session!.user.id } },
    include: {
      student: {
        select: { nama: true, email: true, quizAttempts: { take: 1, orderBy: { createdAt: "desc" } } },
      },
      class: { select: { title: true } },
    },
    orderBy: { joinedAt: "desc" },
  });

  const attempts = await prisma.quizAttempt.findMany({
    where: { quiz: { class: { teacherId: session!.user.id } } },
    include: {
      student: { select: { nama: true } },
      quiz: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Manajemen Siswa"
        description="Pantau siswa dan riwayat attempt kuis"
      />

      <section className="mb-10">
        <h2 className="mb-4 font-display text-xl font-bold">Siswa Terdaftar</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {enrollments.map((e) => (
            <Card key={e.id}>
              <CardTitle className="text-base">{e.student.nama}</CardTitle>
              <CardDescription>
                {e.class.title} · {e.student.email}
              </CardDescription>
            </Card>
          ))}
          {enrollments.length === 0 && (
            <Card><CardDescription>Belum ada siswa terdaftar di kelasmu.</CardDescription></Card>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Riwayat Attempt Kuis</h2>
        <div className="space-y-3">
          {attempts.map((a) => (
            <Card key={a.id} className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{a.student.nama}</CardTitle>
                <CardDescription>{a.quiz.title}</CardDescription>
              </div>
              <Badge variant={a.score >= 60 ? "primary" : "secondary"}>
                {a.score}%
              </Badge>
            </Card>
          ))}
          {attempts.length === 0 && (
            <Card><CardDescription>Belum ada attempt kuis.</CardDescription></Card>
          )}
        </div>
      </section>
    </div>
  );
}