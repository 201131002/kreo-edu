"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteQuizAction, updateQuizAction } from "@/actions/class";
import { SubmitButton } from "@/components/guru/submit-button";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ChevronRight, Coins, Gamepad2, Pencil, Star, Trash2 } from "lucide-react";

export function QuizRow({
  quiz,
  classId,
  showManageLink = true,
}: {
  quiz: {
    id: string;
    title: string;
    rewardExp: number;
    rewardCoins: number;
    questionCount: number;
  };
  classId: string;
  showManageLink?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (editing) {
    return (
      <Card className="border-tertiary/20">
        <form action={updateQuizAction} className="space-y-3">
          <input type="hidden" name="quizId" value={quiz.id} />
          <input type="hidden" name="classId" value={classId} />
          <div>
            <Label htmlFor={`qt-${quiz.id}`}>Nama Kuis</Label>
            <Input
              id={`qt-${quiz.id}`}
              name="title"
              defaultValue={quiz.title}
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor={`qe-${quiz.id}`}>Hadiah EXP</Label>
              <Input
                id={`qe-${quiz.id}`}
                name="rewardExp"
                type="number"
                min={0}
                max={5000}
                defaultValue={quiz.rewardExp}
                required
              />
            </div>
            <div>
              <Label htmlFor={`qc-${quiz.id}`}>Hadiah Koin</Label>
              <Input
                id={`qc-${quiz.id}`}
                name="rewardCoins"
                type="number"
                min={0}
                max={1000}
                defaultValue={quiz.rewardCoins}
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <SubmitButton variant="tertiary" size="sm">
              Simpan
            </SubmitButton>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
            >
              Batal
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <Gamepad2 className="mt-0.5 h-5 w-5 shrink-0 text-tertiary" />
        <div>
          <CardTitle className="text-base">{quiz.title}</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2">
            <span>{quiz.questionCount} soal</span>
            <span className="inline-flex items-center gap-0.5">
              <Star className="h-3 w-3" />+{quiz.rewardExp} EXP
            </span>
            <span className="inline-flex items-center gap-0.5">
              <Coins className="h-3 w-3" />+{quiz.rewardCoins} Koin
            </span>
          </CardDescription>
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <form
          action={(formData) => {
            if (
              !confirm(
                `Hapus kuis "${quiz.title}"? Semua soal dan riwayat attempt ikut terhapus.`
              )
            ) {
              return;
            }
            startTransition(() => deleteQuizAction(formData));
          }}
        >
          <input type="hidden" name="quizId" value={quiz.id} />
          <input type="hidden" name="classId" value={classId} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={pending}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </form>
        {showManageLink && (
          <Link href={`/guru/kelas/${classId}/kuis/${quiz.id}`}>
            <Button variant="outline" size="sm">
              Kelola
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}