import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expForNextLevel } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  Coins,
  MessageCircle,
  ShoppingBag,
  Star,
  Trophy,
  Medal,
  Package,
} from "lucide-react";

export default async function StudentDashboard() {
  const session = await auth();
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session!.user.id },
  });

  const enrollments = await prisma.classEnrollment.count({
    where: { studentId: session!.user.id },
  });

  const attempts = await prisma.quizAttempt.findMany({
    where: { studentId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { quiz: true },
  });

  const level = profile?.currentLevel ?? 1;
  const exp = profile?.currentExp ?? 0;
  const nextExp = expForNextLevel(level);
  const progress = Math.min(100, Math.round((exp % nextExp) / nextExp * 100) || 0);

  const quickLinks = [
    { href: "/kelas", label: "Pilih Kelas", icon: BookOpen, color: "text-primary" },
    { href: "/peringkat", label: "Peringkat Juara", icon: Medal, color: "text-amber-500" },
    { href: "/toko", label: "Toko Reward", icon: ShoppingBag, color: "text-secondary" },
    { href: "/inventori", label: "Inventori", icon: Package, color: "text-primary" },
    { href: "/laporan", label: "Laporan Petualangan", icon: Trophy, color: "text-tertiary" },
    { href: "/jadwal", label: "Jadwal Belajar", icon: Calendar, color: "text-primary" },
    { href: "/pesan", label: "Pesan Diskusi", icon: MessageCircle, color: "text-tertiary" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title={`Halo, ${session!.user.nama}! 👋`}
        description="Siap untuk petualangan belajar hari ini?"
      />

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="primary">Level {level}</Badge>
              <CardTitle className="mt-2">Progress Petualangan</CardTitle>
              <CardDescription>
                {exp} / {nextExp} EXP menuju Level {level + 1}
              </CardDescription>
            </div>
            <Star className="h-10 w-10 text-secondary" />
          </div>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-primary/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-tertiary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </Card>

        <Card className="text-center">
          <Coins className="mx-auto mb-2 h-8 w-8 text-secondary" />
          <p className="font-display text-3xl font-bold text-secondary">
            {profile?.virtualCurrency ?? 0}
          </p>
          <p className="text-sm text-muted">Koin Virtual</p>
        </Card>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card className="flex h-full flex-col items-center gap-2 text-center transition hover:-translate-y-1 hover:shadow-soft">
                <Icon className={`h-8 w-8 ${link.color}`} />
                <span className="text-sm font-bold">{link.label}</span>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Kelas Diikuti</CardTitle>
          <CardDescription>{enrollments} kelas aktif</CardDescription>
          <Link href="/kelas" className="mt-4 inline-block">
            <Button size="sm">Lihat Semua Kelas</Button>
          </Link>
        </Card>

        <Card>
          <CardTitle>Kuis Terbaru</CardTitle>
          {attempts.length === 0 ? (
            <CardDescription>Belum ada kuis diselesaikan</CardDescription>
          ) : (
            <ul className="mt-4 space-y-2">
              {attempts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-sm"
                >
                  <span className="font-medium">{a.quiz.title}</span>
                  <Badge variant={a.score >= 60 ? "primary" : "secondary"}>
                    {a.score}%
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}