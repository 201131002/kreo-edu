-- CreateEnum
CREATE TYPE "BadgeCriteria" AS ENUM ('LEVEL', 'QUIZ_COUNT', 'FIRST_QUIZ');

-- AlterTable: migrate levelMilestone -> criteria + criteriaValue
ALTER TABLE "Badge" ADD COLUMN "criteria" "BadgeCriteria";
ALTER TABLE "Badge" ADD COLUMN "criteriaValue" INTEGER NOT NULL DEFAULT 0;

UPDATE "Badge" SET "criteria" = 'LEVEL', "criteriaValue" = "levelMilestone";

ALTER TABLE "Badge" ALTER COLUMN "criteria" SET NOT NULL;
ALTER TABLE "Badge" DROP CONSTRAINT IF EXISTS "Badge_levelMilestone_key";
ALTER TABLE "Badge" DROP COLUMN "levelMilestone";

CREATE UNIQUE INDEX "Badge_criteria_criteriaValue_key" ON "Badge"("criteria", "criteriaValue");

-- New quiz badges
INSERT INTO "Badge" ("id", "name", "description", "imageUrl", "criteria", "criteriaValue")
VALUES
  ('badge-first-quiz', 'Perdana', 'Selesaikan kuis pertamamu', '/badges/lencana-perdana.svg', 'FIRST_QUIZ', 0),
  ('badge-quiz-1', 'Penguji', 'Selesaikan 1 kuis', '/badges/lencana-kuis-1.svg', 'QUIZ_COUNT', 1),
  ('badge-quiz-5', 'Pejuang Kuis', 'Selesaikan 5 kuis', '/badges/lencana-kuis-5.svg', 'QUIZ_COUNT', 5),
  ('badge-quiz-10', 'Master Kuis', 'Selesaikan 10 kuis', '/badges/lencana-kuis-10.svg', 'QUIZ_COUNT', 10)
ON CONFLICT ("criteria", "criteriaValue") DO NOTHING;

-- Backfill quiz badges for existing students
INSERT INTO "StudentBadge" ("id", "studentId", "badgeId", "earnedAt")
SELECT
    'sbq_' || sp."id" || '_' || b."id",
    sp."id",
    b."id",
    NOW()
FROM "StudentProfile" sp
JOIN "User" u ON u."id" = sp."userId"
JOIN "Badge" b ON (
  (b."criteria" = 'FIRST_QUIZ' AND EXISTS (
    SELECT 1 FROM "QuizAttempt" qa WHERE qa."studentId" = u."id" LIMIT 1
  ))
  OR (b."criteria" = 'QUIZ_COUNT' AND (
    SELECT COUNT(*)::int FROM "QuizAttempt" qa WHERE qa."studentId" = u."id"
  ) >= b."criteriaValue")
  OR (b."criteria" = 'LEVEL' AND sp."currentLevel" >= b."criteriaValue")
)
ON CONFLICT ("studentId", "badgeId") DO NOTHING;