-- CreateEnum
CREATE TYPE "BankSubject" AS ENUM ('MATEMATIKA', 'BAHASA_INDONESIA', 'IPAS', 'PENDIDIKAN_PANCASILA', 'BAHASA_INGGRIS');

-- CreateTable
CREATE TABLE "QuestionBankItem" (
    "id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "subject" "BankSubject" NOT NULL,
    "topic" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "optionC" TEXT NOT NULL,
    "optionD" TEXT NOT NULL,
    "correctOption" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionBankItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionBankItem_grade_subject_idx" ON "QuestionBankItem"("grade", "subject");

-- CreateIndex
CREATE INDEX "QuestionBankItem_subject_idx" ON "QuestionBankItem"("subject");