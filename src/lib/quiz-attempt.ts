export type StoredAnswer = {
  questionId: string;
  selected: "A" | "B" | "C" | "D" | null;
  correct: boolean;
  questionText: string;
  correctOption?: "A" | "B" | "C" | "D";
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
};

export const MAX_ATTEMPTS_PER_DAY = 3;

export type QuestionOptionFields = {
  id: string;
  quizId?: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
};

export function parseAnswersJson(raw: string | null | undefined): StoredAnswer[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredAnswer[];
  } catch {
    return [];
  }
}

export function getOptionText(
  answer: StoredAnswer,
  option: "A" | "B" | "C" | "D"
): string | undefined {
  const map = {
    A: answer.optionA,
    B: answer.optionB,
    C: answer.optionC,
    D: answer.optionD,
  };
  return map[option];
}

export function formatAnswerChoice(
  option: "A" | "B" | "C" | "D" | null | undefined,
  answer: StoredAnswer
): string {
  if (!option) return "—";
  const text = getOptionText(answer, option);
  return text ? `${option}) ${text}` : option;
}

export function enrichAnswersFromQuestions(
  answers: StoredAnswer[],
  questions: QuestionOptionFields[]
): StoredAnswer[] {
  const byId = new Map(questions.map((q) => [q.id, q]));

  return answers.map((answer) => {
    if (answer.correctOption && answer.optionA) {
      return answer;
    }

    const question = byId.get(answer.questionId);
    if (!question) return answer;

    const correctOption = question.correctOption as "A" | "B" | "C" | "D";

    return {
      ...answer,
      questionText: answer.questionText || question.questionText,
      correctOption,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
    };
  });
}