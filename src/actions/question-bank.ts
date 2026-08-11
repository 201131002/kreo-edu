"use server";

import { auth } from "@/lib/auth";
import { parseAikenFile, type ParsedAikenQuestion } from "@/lib/aiken-parser";
import { prisma } from "@/lib/prisma";
import {
  aikenImportSchema,
  bankQuestionSchema,
  questionSchema,
} from "@/lib/validations";
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

function bankRedirect(query: string): never {
  redirect(`/guru/bank-soal?${query}`);
}

function parseQuestionsJson(raw: string): ParsedAikenQuestion[] | null {
  try {
    const parsed = JSON.parse(raw) as ParsedAikenQuestion[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    for (const item of parsed) {
      const valid = questionSchema
        .omit({ quizId: true })
        .safeParse({
          questionText: item.questionText,
          optionA: item.optionA,
          optionB: item.optionB,
          optionC: item.optionC,
          optionD: item.optionD,
          correctOption: item.correctOption,
        });
      if (!valid.success) return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export type AikenPreviewResult = {
  success: true;
  questions: ParsedAikenQuestion[];
  errors: { block: number; line?: number; message: string }[];
};

export type AikenActionError = {
  error: string;
};

export async function createBankQuestionAction(
  formData: FormData
): Promise<void> {
  const session = await requireGuru();

  const parsed = bankQuestionSchema.safeParse({
    grade: formData.get("grade"),
    subject: formData.get("subject"),
    topic: formData.get("topic"),
    questionText: formData.get("questionText"),
    optionA: formData.get("optionA"),
    optionB: formData.get("optionB"),
    optionC: formData.get("optionC"),
    optionD: formData.get("optionD"),
    correctOption: formData.get("correctOption"),
  });

  if (!parsed.success) {
    bankRedirect("error=data-tidak-valid");
  }

  await prisma.questionBankItem.create({
    data: {
      ...parsed.data,
      createdById: session.user.id,
    },
  });

  revalidatePath("/guru/bank-soal");
  bankRedirect("success=soal-bank-ditambah");
}

export async function importAikenToBankAction(
  formData: FormData
): Promise<AikenPreviewResult | AikenActionError | void> {
  const session = await requireGuru();

  const parsed = aikenImportSchema.safeParse({
    step: formData.get("step"),
    content: formData.get("content") ?? undefined,
    questionsJson: formData.get("questionsJson") ?? undefined,
    grade: formData.get("grade") ?? undefined,
    subject: formData.get("subject") ?? undefined,
    topic: formData.get("topic") ?? undefined,
  });

  if (!parsed.success) {
    return { error: "Data tidak valid" };
  }

  const { step, content, questionsJson, grade, subject, topic } = parsed.data;

  if (step === "preview") {
    if (!content?.trim()) {
      return { error: "File kosong atau tidak dapat dibaca" };
    }

    const result = parseAikenFile(content);
    return {
      success: true,
      questions: result.questions,
      errors: result.errors,
    };
  }

  if (!grade || !subject || !topic?.trim()) {
    bankRedirect("error=data-tidak-valid");
  }

  const questions = questionsJson ? parseQuestionsJson(questionsJson) : null;
  if (!questions) {
    bankRedirect("error=data-tidak-valid");
  }

  await prisma.questionBankItem.createMany({
    data: questions.map((q) => ({
      grade,
      subject,
      topic: topic.trim(),
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      createdById: session.user.id,
    })),
  });

  revalidatePath("/guru/bank-soal");
  bankRedirect(`success=aiken-bank-${questions.length}`);
}

export async function importAikenToQuizAction(
  formData: FormData
): Promise<AikenPreviewResult | AikenActionError | void> {
  const session = await requireGuru();

  const parsed = aikenImportSchema.safeParse({
    step: formData.get("step"),
    content: formData.get("content") ?? undefined,
    questionsJson: formData.get("questionsJson") ?? undefined,
    quizId: formData.get("quizId") ?? undefined,
    classId: formData.get("classId") ?? undefined,
  });

  if (!parsed.success) {
    return { error: "Data tidak valid" };
  }

  const { step, content, questionsJson, quizId, classId } = parsed.data;

  if (!quizId || !classId) {
    return { error: "Kuis tidak ditemukan" };
  }

  await requireOwnedQuiz(quizId, session.user.id);

  if (step === "preview") {
    if (!content?.trim()) {
      return { error: "File kosong atau tidak dapat dibaca" };
    }

    const result = parseAikenFile(content);
    return {
      success: true,
      questions: result.questions,
      errors: result.errors,
    };
  }

  const questions = questionsJson ? parseQuestionsJson(questionsJson) : null;
  if (!questions) {
    quizRedirect(classId, quizId, "error=data-tidak-valid");
  }

  await prisma.question.createMany({
    data: questions.map((q) => ({
      quizId,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
    })),
  });

  revalidatePath(`/guru/kelas/${classId}/kuis/${quizId}`);
  revalidatePath(`/kelas/${classId}/kuis/${quizId}`);
  quizRedirect(classId, quizId, `success=aiken-kuis-${questions.length}`);
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