import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Library, Map, Users } from "lucide-react";

export default async function TeacherDashboard() {
  const session = await auth();

  const classCount = await prisma.class.count({
    where: { teacherId: session!.user.id },
  });

  const studentCount = await prisma.classEnrollment.count({
    where: { class: { teacherId: session!.user.id } },
  });

  const quizCount = await prisma.quiz.count({
    where: { class: { teacherId: session!.user.id } },
  });

  const links = [
    {
      href: "/guru/kelas",
      title: "Kelas Saya",
      desc: `${classCount} kelas · ${quizCount} kuis`,
      icon: BookOpen,
    },
    {
      href: "/guru/bank-soal",
      title: "Bank Soal SD",
      desc: "120+ soal Kurikulum Merdeka kelas 1–6",
      icon: Library,
    },
    {
      href: "/guru/jadwal",
      title: "Jadwal Belajar",
      desc: "Atur jadwal mingguan siswa",
      icon: Calendar,
    },
    {
      href: "/guru/siswa",
      title: "Siswa & Progress",
      desc: `${studentCount} siswa terdaftar`,
      icon: Users,
    },
    {
      href: "/guru/kelas",
      title: "Buat Materi & Kuis",
      desc: "Kelola dari dalam setiap kelas",
      icon: Map,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title={`Dashboard Guru — ${session!.user.nama}`}
        description="Buat kelas, tambahkan materi, lalu buat kuis — semuanya dari satu tempat."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Card key={link.title} className="transition hover:-translate-y-1 hover:shadow-soft">
              <Icon className="mb-3 h-10 w-10 text-tertiary" />
              <CardTitle>{link.title}</CardTitle>
              <CardDescription>{link.desc}</CardDescription>
              <Link href={link.href} className="mt-4 inline-block">
                <Button variant="tertiary" size="sm">
                  Buka
                </Button>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}