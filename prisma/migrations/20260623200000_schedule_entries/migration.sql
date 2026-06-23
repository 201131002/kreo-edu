-- CreateEnum
CREATE TYPE "ScheduleDay" AS ENUM ('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU');

-- CreateEnum
CREATE TYPE "ScheduleColor" AS ENUM ('primary', 'secondary', 'tertiary');

-- CreateTable
CREATE TABLE "ScheduleEntry" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "day" "ScheduleDay" NOT NULL,
    "subject" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "color" "ScheduleColor" NOT NULL DEFAULT 'primary',

    CONSTRAINT "ScheduleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduleEntry_classId_idx" ON "ScheduleEntry"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleEntry_classId_day_key" ON "ScheduleEntry"("classId", "day");

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;