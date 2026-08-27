import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuizForm } from "@/components/quiz/quiz-form";

export default async function KuisPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const { id, quizId } = await params;
  const session = await auth();

  // Wajib login untuk mengakses halaman kuis
  if (!session) notFound();

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, classId: id },
    include: { questions: true },
  });

  if (!quiz || quiz.questions.length === 0) notFound();

  // Verifikasi akses berdasarkan role
  if (session.user.role === "SISWA") {
    const enrollment = await prisma.classEnrollment.findFirst({
      where: { classId: quiz.classId, studentId: session.user.id },
    });
    if (!enrollment) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-lg border p-6 text-sm text-muted-foreground">
            Kamu belum bergabung di kelas ini
          </div>
        </div>
      );
    }
  } else if (session.user.role === "GURU") {
    // Guru hanya boleh akses kuis di kelas yang dia ajar
    const ownsClass = await prisma.class.findFirst({
      where: { id: quiz.classId, teacherId: session.user.id },
    });
    if (!ownsClass) notFound();
  }
  // ADMIN boleh akses semua kelas

  const alreadyAttempted =
    session.user.role === "SISWA"
      ? (await prisma.quizAttempt.count({
          where: { studentId: session.user.id, quizId },
        })) > 0
      : false;

  // Strip correctOption dari pertanyaan yang dikirim ke client — jawaban benar
  // hanya boleh ada di server (submitQuizAction), bukan di HTML yang dirender.
  const safeQuestions = quiz.questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <QuizForm
        quizId={quiz.id}
        classId={id}
        title={quiz.title}
        questions={safeQuestions}
        alreadyAttempted={alreadyAttempted}
      />
    </div>
  );
}