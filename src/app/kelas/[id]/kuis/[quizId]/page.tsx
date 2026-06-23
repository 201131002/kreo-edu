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

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, classId: id },
    include: { questions: true },
  });

  if (!quiz || quiz.questions.length === 0) notFound();

  const alreadyAttempted =
    session?.user.role === "SISWA"
      ? (await prisma.quizAttempt.count({
          where: { studentId: session.user.id, quizId },
        })) > 0
      : false;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <QuizForm
        quizId={quiz.id}
        classId={id}
        title={quiz.title}
        questions={quiz.questions}
        alreadyAttempted={alreadyAttempted}
      />
    </div>
  );
}