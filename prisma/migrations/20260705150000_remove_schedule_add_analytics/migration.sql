-- Drop schedule feature
DROP TABLE IF EXISTS "ScheduleEntry";

-- Drop schedule enums
DROP TYPE IF EXISTS "ScheduleDay";
DROP TYPE IF EXISTS "ScheduleColor";

-- Quiz attempt answer breakdown for analytics
ALTER TABLE "QuizAttempt" ADD COLUMN IF NOT EXISTS "answersJson" TEXT;

-- Bank soal creator tracking
ALTER TABLE "QuestionBankItem" ADD COLUMN IF NOT EXISTS "createdById" TEXT;
CREATE INDEX IF NOT EXISTS "QuestionBankItem_createdById_idx" ON "QuestionBankItem"("createdById");
DO $$ BEGIN
  ALTER TABLE "QuestionBankItem" ADD CONSTRAINT "QuestionBankItem_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- FAQ CMS content
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "faqJson" TEXT NOT NULL DEFAULT '[]';