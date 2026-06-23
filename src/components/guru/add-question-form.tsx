"use client";

import { createQuestionAction } from "@/actions/class";
import { SubmitButton } from "@/components/guru/submit-button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";

export function AddQuestionForm({
  classId,
  quizId,
  questionNumber,
}: {
  classId: string;
  quizId: string;
  questionNumber: number;
}) {
  return (
    <form action={createQuestionAction} className="space-y-4">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="quizId" value={quizId} />

      <div>
        <Label htmlFor="questionText">Soal #{questionNumber}</Label>
        <Textarea
          id="questionText"
          name="questionText"
          placeholder="Tulis pertanyaan di sini..."
          rows={2}
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="optionA">Opsi A</Label>
          <Input id="optionA" name="optionA" required />
        </div>
        <div>
          <Label htmlFor="optionB">Opsi B</Label>
          <Input id="optionB" name="optionB" required />
        </div>
        <div>
          <Label htmlFor="optionC">Opsi C</Label>
          <Input id="optionC" name="optionC" required />
        </div>
        <div>
          <Label htmlFor="optionD">Opsi D</Label>
          <Input id="optionD" name="optionD" required />
        </div>
      </div>

      <div>
        <Label htmlFor="correctOption">Jawaban Benar</Label>
        <Select id="correctOption" name="correctOption" defaultValue="A" required>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </Select>
      </div>

      <SubmitButton variant="primary" size="sm">
        Tambah Soal
      </SubmitButton>
    </form>
  );
}