export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

export default async function LaporanPage() {
  const session = await auth();

  const attempts = await prisma.quizAttempt.findMany({
    where: { studentId: session!.user.id },
    include: { quiz: { include: { class: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalExp = attempts.reduce((sum, a) => sum + a.expEarned, 0);
  const totalCoins = attempts.reduce((sum, a) => sum + a.coinsEarned, 0);
  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
      : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Laporan Petualangan"
        description="Riwayat perjalanan belajarmu"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <Trophy className="mx-auto mb-2 h-8 w-8 text-primary" />
          <p className="font-display text-2xl font-bold">{attempts.length}</p>
          <CardDescription>Kuis Diselesaikan</CardDescription>
        </Card>
        <Card className="text-center">
          <p className="font-display text-2xl font-bold text-tertiary">+{totalExp}</p>
          <CardDescription>Total EXP</CardDescription>
        </Card>
        <Card className="text-center">
          <p className="font-display text-2xl font-bold text-secondary">+{totalCoins}</p>
          <CardDescription>Total Koin · Rata-rata {avgScore}%</CardDescription>
        </Card>
      </div>

      {attempts.length === 0 ? (
        <Card>
          <CardTitle>Belum Ada Petualangan</CardTitle>
          <CardDescription>Selesaikan kuis pertama untuk melihat laporan!</CardDescription>
        </Card>
      ) : (
        <div className="space-y-3">
          {attempts.map((a) => (
            <Card key={a.id} className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{a.quiz.title}</CardTitle>
                <CardDescription>
                  {a.quiz.class.title} · {a.correctAnswers}/{a.totalQuestions} benar
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={a.score >= 60 ? "primary" : "secondary"}>
                  {a.score}%
                </Badge>
                <span className="text-xs text-muted">
                  +{a.expEarned} EXP · +{a.coinsEarned} Koin
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}