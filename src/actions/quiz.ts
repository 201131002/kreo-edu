"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { quizSubmitSchema } from "@/lib/validations";
import { syncEarnedBadges } from "@/lib/badge-service";
import { calculateLevel } from "@/lib/utils";
import { revalidatePath } from "next/cache";

import { MAX_ATTEMPTS_PER_DAY } from "@/lib/quiz-attempt";

export async function submitQuizAction(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "SISWA") {
    return { error: "Unauthorized" };
  }

  const answersRaw = formData.get("answers");
  let answers: Record<string, "A" | "B" | "C" | "D"> = {};

  try {
    answers = JSON.parse(String(answersRaw)) as Record<string, "A" | "B" | "C" | "D">;
  } catch {
    return { error: "Jawaban tidak valid" };
  }

  const parsed = quizSubmitSchema.safeParse({
    quizId: formData.get("quizId"),
    answers,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const { quizId, answers: submittedAnswers } = parsed.data;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!quiz) return { error: "Kuis tidak ditemukan" };

  if (session.user.role === "SISWA") {
    const enrollment = await prisma.classEnrollment.findFirst({
      where: { classId: quiz.classId, studentId: session.user.id },
    });
    if (!enrollment) {
      return { error: "Kamu belum bergabung di kelas ini" };
    }
  }

  let correctAnswers = 0;
  const answersJsonRecords = quiz.questions.map((question) => {
    const selected = submittedAnswers[question.id] ?? null;
    const correct = selected === question.correctOption;
    if (correct) correctAnswers += 1;

    return {
      questionId: question.id,
      selected,
      correct,
      questionText: question.questionText,
      correctOption: question.correctOption as "A" | "B" | "C" | "D",
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
    };
  });

  const totalQuestions = quiz.questions.length;
  const score = totalQuestions > 0
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;

  const passThreshold = 60;
  const passed = score >= passThreshold;

  let result: {
    newAttempt: { id: string };
    coinsEarned: number;
    expEarned: number;
    isFirstAttempt: boolean;
  };

  try {
    result = await prisma.$transaction(async (tx) => {
      // Kunci per (studentId, quizId) agar dua submit bersamaan tidak
      // beradu membaca batas harian / status "percobaan pertama".
      // Parameter dipisah agar Prisma mengikatnya sebagai bound parameter,
      // bukan interpolasi string mentah ke SQL.
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${session.user.id} || ':' || ${quizId}))`;

      const attemptsToday = await tx.quizAttempt.count({
        where: {
          studentId: session.user.id,
          quizId,
          createdAt: { gte: today },
        },
      });

      if (attemptsToday >= MAX_ATTEMPTS_PER_DAY) {
        throw new Error("MAX_ATTEMPTS_REACHED");
      }

      const previousAttempts = await tx.quizAttempt.count({
        where: { studentId: session.user.id, quizId },
      });
      const isFirstAttempt = previousAttempts === 0;

      const coinsEarned = isFirstAttempt
        ? passed
          ? quiz.rewardCoins
          : Math.floor(quiz.rewardCoins * 0.3)
        : 0;
      const expEarned = isFirstAttempt
        ? passed
          ? quiz.rewardExp
          : Math.floor(quiz.rewardExp * 0.3)
        : 0;

      const newAttempt = await tx.quizAttempt.create({
        data: {
          quizId,
          studentId: session.user.id,
          score,
          correctAnswers,
          totalQuestions,
          coinsEarned,
          expEarned,
          answersJson: JSON.stringify(answersJsonRecords),
        },
      });

      const profile = await tx.studentProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (profile) {
        let level = profile.currentLevel;

        if (isFirstAttempt && (coinsEarned > 0 || expEarned > 0)) {
          // Kenaikan kredit atomik: tidak membaca lalu menulis absolut
          // sehingga submit bersamaan tidak saling menimpa.
          const updated = await tx.studentProfile.update({
            where: { userId: session.user.id },
            data: {
              currentExp: { increment: expEarned },
              virtualCurrency: { increment: coinsEarned },
            },
          });
          level = calculateLevel(updated.currentExp);
          await tx.studentProfile.update({
            where: { userId: session.user.id },
            data: { currentLevel: level },
          });
        } else {
          // Bukan first-attempt atau tidak ada reward: baca level terkini
          // dari DB agar badge sync mendapat nilai yang akurat, bukan
          // stale value dari awal transaksi.
          const fresh = await tx.studentProfile.findUnique({
            where: { userId: session.user.id },
            select: { currentLevel: true },
          });
          if (fresh) level = fresh.currentLevel;
        }

        await syncEarnedBadges(profile.id, session.user.id, level, tx);
      }

      return { newAttempt, coinsEarned, expEarned, isFirstAttempt };
    });
  } catch (error) {
    if (error instanceof Error && error.message === "MAX_ATTEMPTS_REACHED") {
      return { error: "Kamu sudah mencapai batas 3 kali percobaan kuis hari ini" };
    }
    throw error;
  }

  revalidatePath("/dashboard/siswa");
  revalidatePath("/laporan");
  revalidatePath("/peringkat");
  revalidatePath("/inventori");
  revalidatePath(`/kelas/${quiz.classId}/kuis/${quizId}`);
  revalidatePath(`/kelas/${quiz.classId}/kuis/${quizId}/hasil`);

  return {
    success: true,
    attemptId: result.newAttempt.id,
    score,
    correctAnswers,
    totalQuestions,
    coinsEarned: result.coinsEarned,
    expEarned: result.expEarned,
    isFirstAttempt: result.isFirstAttempt,
    classId: quiz.classId,
  };
}