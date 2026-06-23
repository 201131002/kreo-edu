"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importBankQuestionsBulkAction } from "@/actions/question-bank";
import {
  BankQuestionImportForm,
  type BankQuestionItem,
} from "@/components/guru/bank-question-import-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  GRADE_OPTIONS,
  SUBJECT_LABELS,
  gradeLabel,
} from "@/lib/question-bank-labels";
import type { BankSubject } from "@/generated/prisma/client";
import { BookOpen, CheckSquare, Pencil, Square } from "lucide-react";

export function QuestionBankPanel({
  items,
  classId,
  quizId,
  initialGrade,
  initialSubject,
}: {
  items: BankQuestionItem[];
  classId: string;
  quizId: string;
  initialGrade?: number;
  initialSubject?: BankSubject;
}) {
  const router = useRouter();
  const [grade, setGrade] = useState<number | "">(initialGrade ?? "");
  const [subject, setSubject] = useState<BankSubject | "">(initialSubject ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (grade !== "" && item.grade !== grade) return false;
      if (subject !== "" && item.subject !== subject) return false;
      return true;
    });
  }, [items, grade, subject]);

  function applyFilters(nextGrade: number | "", nextSubject: BankSubject | "") {
    const params = new URLSearchParams();
    if (nextGrade !== "") params.set("grade", String(nextGrade));
    if (nextSubject !== "") params.set("subject", nextSubject);
    const qs = params.toString();
    router.replace(
      `/guru/kelas/${classId}/kuis/${quizId}${qs ? `?${qs}` : ""}`,
      { scroll: false }
    );
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  }

  const editingItem = editingId
    ? items.find((i) => i.id === editingId)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Kelas
          </label>
          <select
            value={grade}
            onChange={(e) => {
              const v = e.target.value ? Number(e.target.value) : "";
              setGrade(v);
              applyFilters(v, subject);
            }}
            className="rounded-xl border border-primary/15 bg-white px-3 py-2 text-sm"
          >
            <option value="">Semua kelas</option>
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {gradeLabel(g)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Mata Pelajaran
          </label>
          <select
            value={subject}
            onChange={(e) => {
              const v = (e.target.value || "") as BankSubject | "";
              setSubject(v);
              applyFilters(grade, v);
            }}
            className="rounded-xl border border-primary/15 bg-white px-3 py-2 text-sm"
          >
            <option value="">Semua mapel</option>
            {(Object.keys(SUBJECT_LABELS) as BankSubject[]).map((s) => (
              <option key={s} value={s}>
                {SUBJECT_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          {filtered.length} soal tersedia · Kurikulum Merdeka SD
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={toggleAll}>
            {selected.size === filtered.length && filtered.length > 0 ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            Pilih semua
          </Button>
          <Button
            type="button"
            variant="tertiary"
            size="sm"
            disabled={selected.size === 0 || pending}
            onClick={() => {
              startTransition(() => {
                const fd = new FormData();
                fd.set("classId", classId);
                fd.set("quizId", quizId);
                fd.set("bankIds", JSON.stringify([...selected]));
                importBankQuestionsBulkAction(fd);
              });
            }}
          >
            {pending
              ? "Menambahkan..."
              : `Tambah ${selected.size || ""} soal terpilih`}
          </Button>
        </div>
      </div>

      {editingItem && (
        <BankQuestionImportForm
          item={editingItem}
          classId={classId}
          quizId={quizId}
          onCancel={() => setEditingId(null)}
        />
      )}

      <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <Card className="py-8 text-center">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted" />
            <CardDescription>
              Tidak ada soal untuk filter ini. Coba kelas atau mapel lain.
            </CardDescription>
          </Card>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              className={`transition ${
                selected.has(item.id) ? "border-tertiary/40 bg-tertiary/5" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleSelect(item.id)}
                  className="mt-1 shrink-0 text-tertiary"
                  aria-label="Pilih soal"
                >
                  {selected.has(item.id) ? (
                    <CheckSquare className="h-5 w-5" />
                  ) : (
                    <Square className="h-5 w-5 text-muted" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap gap-1.5">
                    <Badge variant="primary">{gradeLabel(item.grade)}</Badge>
                    <Badge variant="tertiary">
                      {SUBJECT_LABELS[item.subject as BankSubject]}
                    </Badge>
                    <Badge variant="secondary">{item.topic}</Badge>
                  </div>
                  <CardTitle className="text-sm font-semibold leading-snug">
                    {item.questionText}
                  </CardTitle>
                  <CardDescription className="mt-1 line-clamp-2 text-xs">
                    A. {item.optionA} · B. {item.optionB} · C. {item.optionC} ·
                    D. {item.optionD}
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() =>
                    setEditingId(editingId === item.id ? null : item.id)
                  }
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit & Tambah
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}