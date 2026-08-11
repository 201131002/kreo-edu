"use client";

import { useRef, useState, useTransition } from "react";
import {
  importAikenToBankAction,
  importAikenToQuizAction,
  type AikenActionError,
  type AikenPreviewResult,
} from "@/actions/question-bank";
import type { ParsedAikenQuestion } from "@/lib/aiken-parser";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  BANK_SUBJECTS,
  GRADE_OPTIONS,
  SUBJECT_LABELS,
} from "@/lib/question-bank-labels";
import type { BankSubject } from "@/generated/prisma/client";
import { AlertCircle, CheckCircle2, FileUp, Upload } from "lucide-react";

type ImportTarget = "bank" | "quiz";

export function AikenImportForm({
  target,
  classId,
  quizId,
}: {
  target: ImportTarget;
  classId?: string;
  quizId?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [grade, setGrade] = useState("1");
  const [subject, setSubject] = useState<BankSubject>("MATEMATIKA");
  const [topic, setTopic] = useState("");
  const [preview, setPreview] = useState<ParsedAikenQuestion[]>([]);
  const [parseErrors, setParseErrors] = useState<
    { block: number; line?: number; message: string }[]
  >([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pending, startTransition] = useTransition();

  async function runAction(
    formData: FormData
  ): Promise<AikenPreviewResult | AikenActionError | void> {
    if (target === "bank") {
      return importAikenToBankAction(formData);
    }
    return importAikenToQuizAction(formData);
  }

  function handleFileChange(file: File | null) {
    if (!file) return;

    setFileName(file.name);
    setActionError(null);
    setShowPreview(false);
    setPreview([]);
    setParseErrors([]);

    const reader = new FileReader();
    reader.onload = () => {
      setContent(String(reader.result ?? ""));
    };
    reader.readAsText(file);
  }

  function handlePreview() {
    if (!content.trim()) {
      setActionError("Pilih file .txt terlebih dahulu");
      return;
    }

    startTransition(async () => {
      setActionError(null);
      const formData = new FormData();
      formData.set("step", "preview");
      formData.set("content", content);
      if (classId) formData.set("classId", classId);
      if (quizId) formData.set("quizId", quizId);

      const result = await runAction(formData);

      if (result && "error" in result) {
        setActionError(result.error);
        return;
      }

      if (result && "success" in result) {
        setPreview(result.questions);
        setParseErrors(result.errors);
        setShowPreview(true);
      }
    });
  }

  function handleConfirm() {
    if (target === "bank" && !topic.trim()) {
      setActionError("Topik wajib diisi sebelum konfirmasi");
      return;
    }

    startTransition(async () => {
      setActionError(null);
      const formData = new FormData();
      formData.set("step", "confirm");
      formData.set("questionsJson", JSON.stringify(preview));
      if (classId) formData.set("classId", classId);
      if (quizId) formData.set("quizId", quizId);
      if (target === "bank") {
        formData.set("grade", grade);
        formData.set("subject", subject);
        formData.set("topic", topic.trim());
      }

      await runAction(formData);
    });
  }

  const canConfirm = preview.length > 0 && parseErrors.length === 0;

  return (
    <div className="space-y-4">
      <div>
        <CardTitle className="text-base">Impor Format Aiken (.txt)</CardTitle>
        <CardDescription className="mt-1">
          Unggah file teks berformat Aiken: pertanyaan, opsi A–D, lalu baris{" "}
          <code className="rounded bg-surface px-1">ANSWER: X</code>
        </CardDescription>
      </div>

      <div>
        <Label htmlFor={`aiken-file-${target}`}>File Aiken</Label>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            id={`aiken-file-${target}`}
            type="file"
            accept=".txt,text/plain"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Pilih File
          </Button>
          {fileName && (
            <span className="inline-flex items-center gap-1 text-sm text-muted">
              <FileUp className="h-4 w-4" />
              {fileName}
            </span>
          )}
        </div>
      </div>

      {target === "bank" && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor={`grade-${target}`}>Jenjang Kelas</Label>
            <Select
              id={`grade-${target}`}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
            >
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  Kelas {g}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`subject-${target}`}>Mata Pelajaran</Label>
            <Select
              id={`subject-${target}`}
              value={subject}
              onChange={(e) => setSubject(e.target.value as BankSubject)}
              required
            >
              {BANK_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {SUBJECT_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`topic-${target}`}>Topik</Label>
            <Input
              id={`topic-${target}`}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Pecahan"
              required
            />
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={pending || !content.trim()}
        onClick={handlePreview}
      >
        {pending ? "Memproses..." : "Pratinjau Soal"}
      </Button>

      {actionError && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
          {actionError}
        </p>
      )}

      {showPreview && (
        <div className="space-y-4 rounded-2xl border border-surface bg-surface/40 p-4">
          {parseErrors.length > 0 && (
            <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4" />
                Ditemukan {parseErrors.length} error format
              </p>
              <ul className="list-disc space-y-1 pl-5">
                {parseErrors.map((err) => (
                  <li key={`${err.block}-${err.line ?? 0}-${err.message}`}>
                    Blok {err.block}
                    {err.line ? ` (baris ${err.line})` : ""}: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {preview.length > 0 && (
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm font-medium text-primary">
                <CheckCircle2 className="h-4 w-4" />
                {preview.length} soal siap diimpor
              </p>
              {preview.map((q, idx) => (
                <div
                  key={`${idx}-${q.questionText.slice(0, 20)}`}
                  className="rounded-xl border bg-white p-3 text-sm"
                >
                  <p className="font-medium">
                    {idx + 1}. {q.questionText}
                  </p>
                  <div className="mt-2 grid gap-1 text-muted sm:grid-cols-2">
                    <span>A. {q.optionA}</span>
                    <span>B. {q.optionB}</span>
                    <span>C. {q.optionC}</span>
                    <span>D. {q.optionD}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-tertiary">
                    Jawaban: {q.correctOption}
                  </p>
                </div>
              ))}
            </div>
          )}

          {preview.length === 0 && parseErrors.length > 0 && (
            <p className="text-sm text-muted">
              Tidak ada soal valid. Perbaiki file lalu pratinjau ulang.
            </p>
          )}

          <Button
            type="button"
            variant="tertiary"
            size="sm"
            disabled={pending || !canConfirm}
            onClick={handleConfirm}
          >
            {pending ? "Mengimpor..." : `Konfirmasi Impor (${preview.length} soal)`}
          </Button>
        </div>
      )}
    </div>
  );
}