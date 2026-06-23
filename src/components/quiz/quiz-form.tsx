"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitQuizAction } from "@/actions/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Question = {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
};

export function QuizForm({
  quizId,
  classId,
  questions,
  title,
  alreadyAttempted = false,
}: {
  quizId: string;
  classId: string;
  title: string;
  questions: Question[];
  alreadyAttempted?: boolean;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const options = ["A", "B", "C", "D"] as const;

  function getOptionText(q: Question, opt: string) {
    const map: Record<string, string> = {
      A: q.optionA,
      B: q.optionB,
      C: q.optionC,
      D: q.optionD,
    };
    return map[opt];
  }

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          formData.set("quizId", quizId);
          formData.set("answers", JSON.stringify(answers));
          const result = await submitQuizAction(formData);
          if (result?.error) {
            setError(result.error);
            return;
          }
          if (result?.success) {
            const params = new URLSearchParams({
              score: String(result.score),
              correct: String(result.correctAnswers),
              total: String(result.totalQuestions),
              coins: String(result.coinsEarned),
              exp: String(result.expEarned),
              first: result.isFirstAttempt ? "1" : "0",
            });
            router.push(`/kelas/${classId}/kuis/${quizId}/hasil?${params}`);
          }
        });
      }}
      className="space-y-6"
    >
      <h1 className="font-display text-3xl font-bold">{title}</h1>

      {alreadyAttempted && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Kamu sudah pernah mengerjakan kuis ini. Percobaan ulang tidak memberi EXP
          atau Koin — hanya skor yang dicatat.
        </p>
      )}

      {questions.map((q, idx) => (
        <Card key={q.id}>
          <CardTitle className="text-base">
            {idx + 1}. {q.questionText}
          </CardTitle>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                className={cn(
                  "rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium transition",
                  answers[q.id] === opt
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent bg-surface hover:border-primary/20"
                )}
              >
                <span className="mr-2 font-bold">{opt}.</span>
                {getOptionText(q, opt)}
              </button>
            ))}
          </div>
        </Card>
      ))}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending || Object.keys(answers).length < questions.length}
      >
        {pending ? "Menghitung skor..." : "Kumpulkan Jawaban"}
      </Button>
    </form>
  );
}