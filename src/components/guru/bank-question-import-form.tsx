"use client";

import { useTransition } from "react";
import { importBankQuestionAction } from "@/actions/question-bank";
import { SubmitButton } from "@/components/guru/submit-button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export type BankQuestionItem = {
  id: string;
  grade: number;
  subject: string;
  topic: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
};

export function BankQuestionImportForm({
  item,
  classId,
  quizId,
  onCancel,
}: {
  item: BankQuestionItem;
  classId: string;
  quizId: string;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(() => importBankQuestionAction(formData));
      }}
      className="space-y-4 rounded-2xl border border-tertiary/20 bg-tertiary/5 p-4"
    >
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="quizId" value={quizId} />
      <input type="hidden" name="bankId" value={item.id} />

      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-tertiary">
          Edit soal sebelum ditambahkan ke kuis
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <Label htmlFor={`q-${item.id}`}>Pertanyaan</Label>
        <Textarea
          id={`q-${item.id}`}
          name="questionText"
          defaultValue={item.questionText}
          rows={2}
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(["A", "B", "C", "D"] as const).map((opt) => {
          const key = `option${opt}` as keyof BankQuestionItem;
          return (
            <div key={opt}>
              <Label htmlFor={`${item.id}-${opt}`}>Opsi {opt}</Label>
              <Input
                id={`${item.id}-${opt}`}
                name={`option${opt}`}
                defaultValue={item[key] as string}
                required
              />
            </div>
          );
        })}
      </div>

      <div>
        <Label htmlFor={`correct-${item.id}`}>Jawaban Benar</Label>
        <Select
          id={`correct-${item.id}`}
          name="correctOption"
          defaultValue={item.correctOption}
          required
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </Select>
      </div>

      <SubmitButton variant="tertiary" size="sm" disabled={pending}>
        {pending ? "Menyimpan..." : "Tambah ke Kuis"}
      </SubmitButton>
    </form>
  );
}