"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { quizSubmitSchema } from "@/lib/validations";
import { syncEarnedBadges } from "@/lib/badge-service";
import { calculateLevel } from "@/lib/utils";
import { revalidatePath } from "next/cache";

const MAX_ATTEMPTS_PER_DAY = 3;

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

  const attemptsToday = await prisma.quizAttempt.count({
    where: {
      studentId: session.user.id,
      quizId,
      createdAt: { gte: today },
    },
  });

  if (attemptsToday >= MAX_ATTEMPTS_PER_DAY) {
    return { error: "Kamu sudah mencapai batas 3 kali attempt hari ini" };
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!quiz) return { error: "Kuis tidak ditemukan" };

  let correctAnswers = 0;
  for (const question of quiz.questions) {
    if (submittedAnswers[question.id] === question.correctOption) {
      correctAnswers += 1;
    }
  }

  const totalQuestions = quiz.questions.length;
  const score = totalQuestions > 0
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;

  const passThreshold = 60;
  const passed = score >= passThreshold;

  const previousAttempts = await prisma.quizAttempt.count({
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

  const attempt = await prisma.$transaction(async (tx) => {
    const newAttempt = await tx.quizAttempt.create({
      data: {
        quizId,
        studentId: session.user.id,
        score,
        correctAnswers,
        totalQuestions,
        coinsEarned,
        expEarned,
      },
    });

    const profile = await tx.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (profile) {
      let level = profile.currentLevel;

      if (isFirstAttempt && (coinsEarned > 0 || expEarned > 0)) {
        const newExp = profile.currentExp + expEarned;
        level = calculateLevel(newExp);
        await tx.studentProfile.update({
          where: { userId: session.user.id },
          data: {
            currentExp: newExp,
            currentLevel: level,
            virtualCurrency: profile.virtualCurrency + coinsEarned,
          },
        });
      }

      await syncEarnedBadges(profile.id, session.user.id, level, tx);
    }

    return newAttempt;
  });

  revalidatePath("/dashboard/siswa");
  revalidatePath("/laporan");
  revalidatePath("/peringkat");
  revalidatePath("/inventori");
  revalidatePath(`/kelas/${quiz.classId}/kuis/${quizId}`);
  revalidatePath(`/kelas/${quiz.classId}/kuis/${quizId}/hasil`);

  return {
    success: true,
    attemptId: attempt.id,
    score,
    correctAnswers,
    totalQuestions,
    coinsEarned,
    expEarned,
    isFirstAttempt,
    classId: quiz.classId,
  };
}