import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FlashAlert } from "@/components/guru/flash-alert";
import { GuruBreadcrumb } from "@/components/guru/breadcrumb";
import { AddQuestionForm } from "@/components/guru/add-question-form";
import { AikenImportForm } from "@/components/guru/aiken-import-form";
import { QuestionBankPanel } from "@/components/guru/question-bank-panel";
import { QuestionRow } from "@/components/guru/question-row";
import { QuizRow } from "@/components/guru/quiz-row";
import type { BankSubject } from "@/generated/prisma/client";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Star } from "lucide-react";

export default async function GuruQuizBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; quizId: string }>;
  searchParams: Promise<{
    success?: string;
    error?: string;
    grade?: string;
    subject?: string;
  }>;
}) {
  const { id, quizId } = await params;
  const sp = await searchParams;
  const bankGrade = sp.grade ? Number(sp.grade) : undefined;
  const bankSubject = sp.subject as BankSubject | undefined;
  const session = await auth();

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, classId: id, class: { teacherId: session!.user.id } },
    include: {
      class: true,
      questions: { orderBy: { id: "asc" } },
    },
  });

  if (!quiz) notFound();

  const bankItems = await prisma.questionBankItem.findMany({
    where: {
      ...(bankGrade ? { grade: bankGrade } : {}),
      ...(bankSubject ? { subject: bankSubject } : {}),
    },
    orderBy: [{ grade: "asc" }, { subject: "asc" }, { topic: "asc" }],
  });

  const isReady = quiz.questions.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <GuruBreadcrumb
        items={[
          { label: "Kelas Saya", href: "/guru/kelas" },
          { label: quiz.class.title, href: `/guru/kelas/${id}?tab=kuis` },
          { label: quiz.title },
        ]}
      />

      <FlashAlert success={sp.success} error={sp.error} />

      <div className="mb-6">
        <QuizRow
          classId={id}
          showManageLink={false}
          quiz={{
            id: quiz.id,
            title: quiz.title,
            rewardExp: quiz.rewardExp,
            rewardCoins: quiz.rewardCoins,
            questionCount: quiz.questions.length,
          }}
        />
        {isReady && (
          <div className="mt-3 text-right">
            <Link href={`/kelas/${id}/kuis/${quizId}`} target="_blank">
              <Button variant="outline" size="sm">
                Pratinjau Siswa
              </Button>
            </Link>
          </div>
        )}
      </div>

      {quiz.questions.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
            Daftar Soal ({quiz.questions.length})
          </h2>
          <div className="space-y-3">
            {quiz.questions.map((q, idx) => (
              <QuestionRow
                key={q.id}
                question={q}
                index={idx}
                classId={id}
                quizId={quizId}
              />
            ))}
          </div>
        </div>
      )}

      <Card className="mb-6 border-tertiary/20">
        <CardTitle className="text-base">Bank Soal — Kelas 1–6 SD</CardTitle>
        <CardDescription className="mb-4">
          Pilih soal dari kurikulum, centang untuk tambah cepat, atau klik{" "}
          <strong>Edit & Tambah</strong> untuk mengubah dulu.
        </CardDescription>
        <QuestionBankPanel
          items={bankItems}
          classId={id}
          quizId={quizId}
          initialGrade={bankGrade}
          initialSubject={bankSubject}
        />
        <p className="mt-3 text-center text-xs text-muted">
          <a href="/guru/bank-soal" className="text-tertiary underline">
            Lihat semua bank soal
          </a>
        </p>
      </Card>

      <Card className="mb-6 border-primary/20">
        <AikenImportForm target="quiz" classId={id} quizId={quizId} />
      </Card>

      <Card>
        <CardTitle className="text-base">
          {quiz.questions.length === 0
            ? "Atau Buat Soal Manual"
            : `Tambah Soal Manual #${quiz.questions.length + 1}`}
        </CardTitle>
        <CardDescription className="mb-4">
          Tulis soal sendiri jika tidak ada di bank soal
        </CardDescription>
        <AddQuestionForm
          classId={id}
          quizId={quizId}
          questionNumber={quiz.questions.length + 1}
        />
      </Card>

      {isReady && (
        <div className="mt-6 text-center">
          <Link href={`/guru/kelas/${id}?tab=kuis&success=kuis-siap`}>
            <Button variant="tertiary">Selesai — Kembali ke Kelas</Button>
          </Link>
        </div>
      )}
    </div>
  );
}