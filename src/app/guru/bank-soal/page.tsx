import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FlashAlert } from "@/components/guru/flash-alert";
import { AddBankQuestionForm } from "@/components/guru/add-bank-question-form";
import { AikenImportForm } from "@/components/guru/aiken-import-form";
import {
  GRADE_OPTIONS,
  SUBJECT_LABELS,
  gradeLabel,
} from "@/lib/question-bank-labels";
import type { BankSubject } from "@/generated/prisma/client";
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

export default async function GuruBankSoalPage({
  searchParams,
}: {
  searchParams: Promise<{
    grade?: string;
    subject?: string;
    q?: string;
    page?: string;
    success?: string;
    error?: string;
  }>;
}) {
  const sp = await searchParams;
  const t = await getTranslations("guru.questionBank");
  const grade = sp.grade ? Number(sp.grade) : undefined;
  const subject = sp.subject as BankSubject | undefined;
  const search = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const where = {
    ...(grade ? { grade } : {}),
    ...(subject ? { subject } : {}),
    ...(search
      ? {
          questionText: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {}),
  };

  const [items, filteredTotal, total] = await Promise.all([
    prisma.questionBankItem.findMany({
      where,
      orderBy: [{ grade: "asc" }, { subject: "asc" }, { topic: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.questionBankItem.count({ where }),
    prisma.questionBankItem.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  function filterHref(overrides: {
    grade?: number;
    subject?: BankSubject;
    q?: string;
    page?: number;
  }) {
    const params = new URLSearchParams();
    const nextGrade = "grade" in overrides ? overrides.grade : grade;
    const nextSubject = "subject" in overrides ? overrides.subject : subject;
    const nextQ = overrides.q ?? search;
    const nextPage = overrides.page ?? 1;

    if (nextGrade) params.set("grade", String(nextGrade));
    if (nextSubject) params.set("subject", nextSubject);
    if (nextQ) params.set("q", nextQ);
    if (nextPage > 1) params.set("page", String(nextPage));

    const qs = params.toString();
    return `/guru/bank-soal${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader title={t("title")} description={t("description")} />

      <FlashAlert success={sp.success} error={sp.error} />

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-4 text-base">Tambah Soal Manual</CardTitle>
          <AddBankQuestionForm />
        </Card>
        <Card>
          <AikenImportForm target="bank" />
        </Card>
      </div>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        {grade ? <input type="hidden" name="grade" value={grade} /> : null}
        {subject ? <input type="hidden" name="subject" value={subject} /> : null}
        <div className="min-w-[220px] flex-1">
          <label htmlFor="search-q" className="mb-2 block text-sm font-semibold">
            Cari Pertanyaan
          </label>
          <Input
            id="search-q"
            name="q"
            defaultValue={search}
            placeholder="Ketik kata kunci soal..."
          />
        </div>
        <Button type="submit" variant="primary" size="sm">
          Cari
        </Button>
        {search && (
          <Link href={filterHref({ q: "" })}>
            <Button type="button" variant="outline" size="sm">
              Reset
            </Button>
          </Link>
        )}
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href={filterHref({ grade: undefined, subject: undefined, q: search })}>
          <Button variant={!grade && !subject ? "tertiary" : "outline"} size="sm">
            Semua
          </Button>
        </Link>
        {GRADE_OPTIONS.map((g) => (
          <Link key={g} href={filterHref({ grade: g, q: search })}>
            <Button variant={grade === g ? "tertiary" : "outline"} size="sm">
              {gradeLabel(g)}
            </Button>
          </Link>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(SUBJECT_LABELS) as BankSubject[]).map((s) => (
          <Link key={s} href={filterHref({ subject: s, q: search })}>
            <Button variant={subject === s ? "primary" : "outline"} size="sm">
              {SUBJECT_LABELS[s]}
            </Button>
          </Link>
        ))}
      </div>

      <p className="mb-4 text-sm text-muted">
        Menampilkan {items.length} dari {filteredTotal} soal
        {grade ? ` · ${gradeLabel(grade)}` : ""}
        {subject ? ` · ${SUBJECT_LABELS[subject]}` : ""}
        {search ? ` · pencarian: "${search}"` : ""}
        {totalPages > 1 ? ` · halaman ${currentPage}/${totalPages}` : ""}
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

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {currentPage > 1 ? (
            <Link href={filterHref({ page: currentPage - 1, q: search })}>
              <Button variant="outline" size="sm">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Sebelumnya
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Sebelumnya
            </Button>
          )}
          <span className="text-sm text-muted">
            Halaman {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link href={filterHref({ page: currentPage + 1, q: search })}>
              <Button variant="outline" size="sm">
                Selanjutnya
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Selanjutnya
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
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