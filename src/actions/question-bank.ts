"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { questionSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireGuru() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") {
    redirect("/dashboard/guru?error=unauthorized");
  }
  return session;
}

async function requireOwnedQuiz(quizId: string, teacherId: string) {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, class: { teacherId } },
    include: { class: true },
  });
  if (!quiz) redirect("/guru/kelas?error=kuis-tidak-ditemukan");
  return quiz;
}

function quizRedirect(classId: string, quizId: string, query: string): never {
  redirect(`/guru/kelas/${classId}/kuis/${quizId}?${query}`);
}

export async function importBankQuestionAction(formData: FormData): Promise<void> {
  const session = await requireGuru();

  const quizId = String(formData.get("quizId") ?? "");
  const classId = String(formData.get("classId") ?? "");
  const bankId = String(formData.get("bankId") ?? "");

  if (!quizId || !classId) {
    redirect("/guru/kelas?error=data-tidak-valid");
  }

  await requireOwnedQuiz(quizId, session.user.id);

  let defaults: {
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: "A" | "B" | "C" | "D";
  } = {
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "A",
  };

  if (bankId) {
    const bankItem = await prisma.questionBankItem.findUnique({
      where: { id: bankId },
    });
    if (!bankItem) {
      quizRedirect(classId, quizId, "error=soal-bank-tidak-ditemukan");
    }
    defaults = {
      questionText: bankItem.questionText,
      optionA: bankItem.optionA,
      optionB: bankItem.optionB,
      optionC: bankItem.optionC,
      optionD: bankItem.optionD,
      correctOption: bankItem.correctOption as "A" | "B" | "C" | "D",
    };
  }

  const parsed = questionSchema.safeParse({
    questionText: formData.get("questionText") ?? defaults.questionText,
    optionA: formData.get("optionA") ?? defaults.optionA,
    optionB: formData.get("optionB") ?? defaults.optionB,
    optionC: formData.get("optionC") ?? defaults.optionC,
    optionD: formData.get("optionD") ?? defaults.optionD,
    correctOption: formData.get("correctOption") ?? defaults.correctOption,
    quizId,
  });

  if (!parsed.success) {
    quizRedirect(classId, quizId, "error=data-tidak-valid");
  }

  await prisma.question.create({ data: parsed.data });

  revalidatePath(`/guru/kelas/${classId}/kuis/${quizId}`);
  revalidatePath(`/kelas/${classId}/kuis/${quizId}`);
  quizRedirect(classId, quizId, "success=soal-ditambah");
}

export async function importBankQuestionsBulkAction(
  formData: FormData
): Promise<void> {
  const session = await requireGuru();

  const quizId = String(formData.get("quizId") ?? "");
  const classId = String(formData.get("classId") ?? "");
  const bankIdsRaw = String(formData.get("bankIds") ?? "");

  if (!quizId || !classId || !bankIdsRaw) {
    redirect("/guru/kelas?error=data-tidak-valid");
  }

  let bankIds: string[];
  try {
    bankIds = JSON.parse(bankIdsRaw) as string[];
  } catch {
    quizRedirect(classId, quizId, "error=data-tidak-valid");
  }

  if (!Array.isArray(bankIds) || bankIds.length === 0) {
    quizRedirect(classId, quizId, "error=pilih-soal-dulu");
  }

  await requireOwnedQuiz(quizId, session.user.id);

  const bankItems = await prisma.questionBankItem.findMany({
    where: { id: { in: bankIds } },
  });

  if (bankItems.length === 0) {
    quizRedirect(classId, quizId, "error=soal-bank-tidak-ditemukan");
  }

  await prisma.question.createMany({
    data: bankItems.map((item) => ({
      quizId,
      questionText: item.questionText,
      optionA: item.optionA,
      optionB: item.optionB,
      optionC: item.optionC,
      optionD: item.optionD,
      correctOption: item.correctOption,
    })),
  });

  revalidatePath(`/guru/kelas/${classId}/kuis/${quizId}`);
  revalidatePath(`/kelas/${classId}/kuis/${quizId}`);
  quizRedirect(classId, quizId, `success=soal-bank-${bankItems.length}`);
}