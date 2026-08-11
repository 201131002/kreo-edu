"use client";

import { useTransition } from "react";
import { createBankQuestionAction } from "@/actions/question-bank";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  BANK_SUBJECTS,
  GRADE_OPTIONS,
  SUBJECT_LABELS,
} from "@/lib/question-bank-labels";
import type { BankSubject } from "@/generated/prisma/client";
import { Loader2 } from "lucide-react";

export function AddBankQuestionForm() {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(() => createBankQuestionAction(formData));
      }}
      className="space-y-4"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="bank-grade">Jenjang Kelas</Label>
          <Select id="bank-grade" name="grade" defaultValue="1" required>
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>
                Kelas {g}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="bank-subject">Mata Pelajaran</Label>
          <Select id="bank-subject" name="subject" defaultValue="MATEMATIKA" required>
            {BANK_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {SUBJECT_LABELS[s as BankSubject]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="bank-topic">Topik</Label>
          <Input
            id="bank-topic"
            name="topic"
            placeholder="Contoh: Operasi Hitung"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="bank-questionText">Pertanyaan</Label>
        <Textarea
          id="bank-questionText"
          name="questionText"
          rows={2}
          placeholder="Tulis pertanyaan di sini..."
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(["A", "B", "C", "D"] as const).map((opt) => (
          <div key={opt}>
            <Label htmlFor={`bank-option${opt}`}>Opsi {opt}</Label>
            <Input id={`bank-option${opt}`} name={`option${opt}`} required />
          </div>
        ))}
      </div>

      <div>
        <Label htmlFor="bank-correctOption">Jawaban Benar</Label>
        <Select id="bank-correctOption" name="correctOption" defaultValue="A" required>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </Select>
      </div>

      <Button type="submit" variant="primary" size="sm" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Menyimpan..." : "Tambah ke Bank Soal"}
      </Button>
    </form>
  );
}