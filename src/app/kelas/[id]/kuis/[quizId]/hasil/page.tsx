import Link from "next/link";
import { PartyPopper, Coins, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function HasilKuisPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; quizId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id, quizId } = await params;
  const sp = await searchParams;

  const score = Number(sp.score ?? 0);
  const correct = Number(sp.correct ?? 0);
  const total = Number(sp.total ?? 0);
  const coins = Number(sp.coins ?? 0);
  const exp = Number(sp.exp ?? 0);
  const isFirstAttempt = sp.first !== "0";
  const passed = score >= 60;
  const earnedRewards = isFirstAttempt && (coins > 0 || exp > 0);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4 py-16">
      <Card className="w-full text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary text-white">
          <PartyPopper className="h-10 w-10" />
        </div>

        <Badge variant={passed ? "primary" : "secondary"} className="mb-3">
          {passed ? "Luar Biasa!" : "Terus Semangat!"}
        </Badge>

        <CardTitle className="text-2xl">
          {passed ? "Selamat, Kamu Hebat! 🎉" : "Jangan Menyerah! 💪"}
        </CardTitle>
        <CardDescription className="mt-2">
          Kamu menjawab {correct} dari {total} soal dengan benar
        </CardDescription>

        <p className="mt-6 font-display text-5xl font-bold text-primary">
          {score}%
        </p>

        {earnedRewards ? (
          <div className="mt-6 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-tertiary" />
              <span className="font-bold text-tertiary">+{exp} EXP</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-secondary" />
              <span className="font-bold text-secondary">+{coins} Koin</span>
            </div>
          </div>
        ) : (
          <p className="mt-6 rounded-2xl bg-surface px-4 py-3 text-sm text-muted">
            {isFirstAttempt
              ? "Skor di bawah 60% — tidak ada EXP atau Koin kali ini. Coba lagi besok!"
              : "Kamu sudah pernah menyelesaikan kuis ini. EXP dan Koin hanya diberikan pada percobaan pertama."}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Link href={`/kelas/${id}/materi`}>
            <Button className="w-full">Kembali ke Kelas</Button>
          </Link>
          <Link href={`/kelas/${id}/kuis/${quizId}`}>
            <Button variant="outline" className="w-full">
              Coba Lagi
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}