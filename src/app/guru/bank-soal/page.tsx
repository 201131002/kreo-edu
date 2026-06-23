import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  GRADE_OPTIONS,
  SUBJECT_LABELS,
  gradeLabel,
} from "@/lib/question-bank-labels";
import type { BankSubject } from "@/generated/prisma/client";
import { BookOpen, CheckCircle2 } from "lucide-react";

export default async function GuruBankSoalPage({
  searchParams,
}: {
  searchParams: Promise<{ grade?: string; subject?: string }>;
}) {
  const sp = await searchParams;
  const grade = sp.grade ? Number(sp.grade) : undefined;
  const subject = sp.subject as BankSubject | undefined;

  const items = await prisma.questionBankItem.findMany({
    where: {
      ...(grade ? { grade } : {}),
      ...(subject ? { subject } : {}),
    },
    orderBy: [{ grade: "asc" }, { subject: "asc" }, { topic: "asc" }],
  });

  const total = await prisma.questionBankItem.count();

  function filterHref(nextGrade?: number, nextSubject?: BankSubject) {
    const params = new URLSearchParams();
    if (nextGrade) params.set("grade", String(nextGrade));
    if (nextSubject) params.set("subject", nextSubject);
    const qs = params.toString();
    return `/guru/bank-soal${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Bank Soal SD"
        description={`${total} soal siap pakai untuk Kelas 1–6 sesuai Kurikulum Merdeka. Pilih saat membuat kuis, lalu edit sesuai kebutuhan.`}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href={filterHref()}>
          <Button
            variant={!grade && !subject ? "tertiary" : "outline"}
            size="sm"
          >
            Semua
          </Button>
        </Link>
        {GRADE_OPTIONS.map((g) => (
          <Link key={g} href={filterHref(g, subject)}>
            <Button
              variant={grade === g ? "tertiary" : "outline"}
              size="sm"
            >
              {gradeLabel(g)}
            </Button>
          </Link>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(SUBJECT_LABELS) as BankSubject[]).map((s) => (
          <Link key={s} href={filterHref(grade, s)}>
            <Button
              variant={subject === s ? "primary" : "outline"}
              size="sm"
            >
              {SUBJECT_LABELS[s]}
            </Button>
          </Link>
        ))}
      </div>

      <p className="mb-4 text-sm text-muted">
        Menampilkan {items.length} soal
        {grade ? ` · ${gradeLabel(grade)}` : ""}
        {subject ? ` · ${SUBJECT_LABELS[subject]}` : ""}
      </p>

      {items.length === 0 ? (
        <Card className="py-12 text-center">
          <BookOpen className="mx-auto mb-3 h-12 w-12 text-muted" />
          <CardDescription>Tidak ada soal untuk filter ini.</CardDescription>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <div className="mb-2 flex flex-wrap gap-1.5">
                <Badge variant="primary">{gradeLabel(item.grade)}</Badge>
                <Badge variant="tertiary">{SUBJECT_LABELS[item.subject]}</Badge>
                <Badge variant="secondary">{item.topic}</Badge>
              </div>
              <CardTitle className="text-base">{item.questionText}</CardTitle>
              <div className="mt-2 grid gap-1 text-sm text-muted sm:grid-cols-2">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const key = `option${opt}` as keyof typeof item;
                  const text = item[key] as string;
                  const isCorrect = item.correctOption === opt;
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
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/guru/kelas">
          <Button variant="tertiary">Buat Kuis & Ambil dari Bank Soal</Button>
        </Link>
      </div>
    </div>
  );
}