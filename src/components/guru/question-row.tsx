"use client";

import { useState, useTransition } from "react";
import {
  deleteQuestionAction,
  updateQuestionAction,
} from "@/actions/class";
import { SubmitButton } from "@/components/guru/submit-button";
import { Button } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";

type QuestionData = {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
};

export function QuestionRow({
  question,
  index,
  classId,
  quizId,
}: {
  question: QuestionData;
  index: number;
  classId: string;
  quizId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (editing) {
    return (
      <Card className="border-primary/20">
        <form action={updateQuestionAction} className="space-y-3">
          <input type="hidden" name="questionId" value={question.id} />
          <input type="hidden" name="classId" value={classId} />
          <input type="hidden" name="quizId" value={quizId} />
          <CardTitle className="text-sm">Edit Soal #{index + 1}</CardTitle>
          <div>
            <Label htmlFor={`q-${question.id}`}>Pertanyaan</Label>
            <Textarea
              id={`q-${question.id}`}
              name="questionText"
              defaultValue={question.questionText}
              rows={2}
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["A", "B", "C", "D"] as const).map((opt) => {
              const key = `option${opt}` as keyof QuestionData;
              return (
                <div key={opt}>
                  <Label htmlFor={`${question.id}-${opt}`}>Opsi {opt}</Label>
                  <Input
                    id={`${question.id}-${opt}`}
                    name={`option${opt}`}
                    defaultValue={question[key] as string}
                    required
                  />
                </div>
              );
            })}
          </div>
          <div>
            <Label htmlFor={`correct-${question.id}`}>Jawaban Benar</Label>
            <Select
              id={`correct-${question.id}`}
              name="correctOption"
              defaultValue={question.correctOption}
              required
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </Select>
          </div>
          <div className="flex gap-2">
            <SubmitButton variant="primary" size="sm">
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
    <Card>
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base">{question.questionText}</CardTitle>
          <div className="mt-2 grid gap-1 text-sm text-muted sm:grid-cols-2">
            {(["A", "B", "C", "D"] as const).map((opt) => {
              const key = `option${opt}` as keyof QuestionData;
              const text = question[key] as string;
              const isCorrect = question.correctOption === opt;
              return (
                <span
                  key={opt}
                  className={
                    isCorrect ? "font-semibold text-primary" : undefined
                  }
                >
                  {isCorrect && (
                    <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                  )}
                  {opt}. {text}
                </span>
              );
            })}
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
          <ConfirmForm
            confirmMessage={`Hapus soal #${index + 1}?`}
            action={deleteQuestionAction}
          >
            {(isPending) => (
              <>
                <input type="hidden" name="questionId" value={question.id} />
                <input type="hidden" name="classId" value={classId} />
                <input type="hidden" name="quizId" value={quizId} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  disabled={pending || isPending}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </ConfirmForm>
        </div>
      </div>
    </Card>
  );
}