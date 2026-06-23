import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { FlashAlert } from "@/components/guru/flash-alert";
import { ScheduleForm } from "@/components/guru/schedule-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default async function GuruJadwalPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; success?: string; error?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;

  const classes = await prisma.class.findMany({
    where: { teacherId: session!.user.id },
    orderBy: { title: "asc" },
    include: {
      _count: { select: { enrollments: true, scheduleEntries: true } },
    },
  });

  const selectedClassId =
    sp.classId && classes.some((c) => c.id === sp.classId)
      ? sp.classId
      : classes[0]?.id;

  const scheduleEntries = selectedClassId
    ? await prisma.scheduleEntry.findMany({
        where: { classId: selectedClassId },
        orderBy: { day: "asc" },
      })
    : [];

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Jadwal Belajar Siswa"
        description="Atur jadwal mingguan per kelas — siswa yang terdaftar akan melihatnya di halaman Jadwal."
      />

      <FlashAlert success={sp.success} error={sp.error} />

      {classes.length === 0 ? (
        <Card className="py-12 text-center">
          <Calendar className="mx-auto mb-3 h-12 w-12 text-muted" />
          <CardDescription className="text-base">
            Belum ada kelas. Buat kelas dulu untuk mengatur jadwal.
          </CardDescription>
          <Link href="/guru/kelas" className="mt-4 inline-block">
            <Button variant="tertiary" size="sm">
              Ke Kelas Saya
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {classes.map((cls) => (
              <Link
                key={cls.id}
                href={`/guru/jadwal?classId=${cls.id}`}
                className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                  cls.id === selectedClassId
                    ? "border-tertiary bg-tertiary/10 text-tertiary"
                    : "border-primary/15 text-muted hover:border-primary/30"
                }`}
              >
                {cls.title}
                <span className="ml-2 text-xs opacity-70">
                  ({cls._count.enrollments} siswa)
                </span>
              </Link>
            ))}
          </div>

          {selectedClass && (
            <Card>
              <CardTitle className="mb-1">{selectedClass.title}</CardTitle>
              <CardDescription className="mb-6">
                {selectedClass._count.scheduleEntries > 0
                  ? `${selectedClass._count.scheduleEntries} hari terjadwal`
                  : "Belum ada jadwal — isi formulir di bawah"}
              </CardDescription>
              <ScheduleForm
                classId={selectedClass.id}
                entries={scheduleEntries}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}