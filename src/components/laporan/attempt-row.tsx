"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatAnswerChoice,
  type StoredAnswer,
} from "@/lib/quiz-attempt";
import { ChevronDown, ChevronUp } from "lucide-react";

export function AttemptRow({
  attemptId,
  quizTitle,
  classTitle,
  correctAnswers,
  totalQuestions,
  score,
  expEarned,
  coinsEarned,
  completedAt,
  answers,
}: {
  attemptId: string;
  quizTitle: string;
  classTitle: string;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  expEarned: number;
  coinsEarned: number;
  completedAt: string;
  answers: StoredAnswer[];
}) {
  const t = useTranslations("laporan");
  const [expanded, setExpanded] = useState(false);
  const hasDetail = answers.length > 0;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">{quizTitle}</CardTitle>
          <CardDescription>
            {t("classInfo", {
              className: classTitle,
              correct: correctAnswers,
              total: totalQuestions,
            })}
          </CardDescription>
          <p className="mt-1 text-xs text-muted">
            {t("completedAt", { datetime: completedAt })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={score >= 60 ? "primary" : "secondary"}>
            {score}%
          </Badge>
          <span className="text-xs text-muted">
            +{expEarned} EXP · +{coinsEarned} Koin
          </span>
          {hasDetail ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="mr-1 h-4 w-4" />
                  {t("hideDetail")}
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-4 w-4" />
                  {t("showDetail")}
                </>
              )}
            </Button>
          ) : (
            <span className="text-xs text-muted">{t("noAnswerDetail")}</span>
          )}
        </div>
      </div>

      {expanded && hasDetail && (
        <div className="mt-4 space-y-2 border-t border-surface pt-4">
          {answers.map((answer, index) => (
            <div
              key={`${attemptId}-${answer.questionId}`}
              className="rounded-xl bg-surface/60 px-3 py-2 text-sm"
            >
              <p className="font-medium">
                {index + 1}. {answer.questionText}
              </p>
              <p className="mt-1 text-muted">
                {t("yourAnswer", {
                  answer: formatAnswerChoice(answer.selected, answer),
                })}
              </p>
              <p className="mt-1 font-medium text-primary">
                {t("correctAnswer", {
                  answer: formatAnswerChoice(answer.correctOption, answer),
                })}
              </p>
              <p
                className={
                  answer.correct
                    ? "mt-1 text-xs font-semibold text-primary"
                    : "mt-1 text-xs font-semibold text-red-600"
                }
              >
                {answer.correct ? t("answerCorrect") : t("answerIncorrect")}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}