export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Card, CardDescription } from "@/components/ui/card";
import { Trophy, Star, Users } from "lucide-react";

export default async function PeringkatPage() {
  const session = await auth();

  const profiles = await prisma.studentProfile.findMany({
    orderBy: [{ currentExp: "desc" }, { currentLevel: "desc" }],
    take: 50,
    include: {
      user: {
        select: {
          id: true,
          nama: true,
          imageUrl: true,
          _count: { select: { quizAttempts: true } },
        },
      },
      activeBorder: {
        select: { borderImageUrl: true },
      },
      activeBadge: {
        select: { name: true, imageUrl: true },
      },
    },
  });

  const leaders = profiles.map((p, index) => ({
    rank: index + 1,
    userId: p.user.id,
    nama: p.user.nama,
    imageUrl: p.user.imageUrl,
    borderImageUrl: p.activeBorder?.borderImageUrl ?? null,
    badgeName: p.activeBadge?.name ?? null,
    badgeImageUrl: p.activeBadge?.imageUrl ?? null,
    level: p.currentLevel,
    exp: p.currentExp,
    coins: p.virtualCurrency,
    quizCount: p.user._count.quizAttempts,
    isCurrentUser: p.user.id === session!.user.id,
  }));

  const currentUserRank = leaders.find((l) => l.isCurrentUser);
  const totalStudents = await prisma.user.count({ where: { role: "SISWA" } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHeader
        title="Peringkat Juara"
        description="Lihat siapa pahlawan pengetahuan terbaik di KREO!"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <Users className="mx-auto mb-2 h-7 w-7 text-primary" />
          <p className="font-display text-2xl font-bold text-primary">
            {totalStudents}
          </p>
          <CardDescription>Total Siswa</CardDescription>
        </Card>
        <Card className="text-center">
          <Trophy className="mx-auto mb-2 h-7 w-7 text-amber-500" />
          <p className="font-display text-2xl font-bold text-amber-500">
            {leaders[0]?.nama ?? "—"}
          </p>
          <CardDescription>Juara #1</CardDescription>
        </Card>
        {session!.user.role === "SISWA" && currentUserRank ? (
          <Card className="border-primary/30 text-center ring-1 ring-primary/20">
            <Star className="mx-auto mb-2 h-7 w-7 text-primary" />
            <p className="font-display text-2xl font-bold text-primary">
              #{currentUserRank.rank}
            </p>
            <CardDescription>Peringkatmu</CardDescription>
          </Card>
        ) : (
          <Card className="text-center">
            <Star className="mx-auto mb-2 h-7 w-7 text-tertiary" />
            <p className="font-display text-2xl font-bold text-tertiary">
              {leaders[0]?.exp ?? 0}
            </p>
            <CardDescription>EXP Tertinggi</CardDescription>
          </Card>
        )}
      </div>

      <h2 className="mb-4 font-display text-lg font-bold">Top 50 Pahlawan</h2>
      <LeaderboardTable leaders={leaders} />
    </div>
  );
}