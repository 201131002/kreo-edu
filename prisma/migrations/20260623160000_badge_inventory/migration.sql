-- AlterTable Badge: add imageUrl
ALTER TABLE "Badge" ADD COLUMN "imageUrl" TEXT;

UPDATE "Badge" SET "imageUrl" = '/badges/lencana-pemula.svg' WHERE "levelMilestone" = 1;
UPDATE "Badge" SET "imageUrl" = '/badges/lencana-penjelajah.svg' WHERE "levelMilestone" = 5;
UPDATE "Badge" SET "imageUrl" = '/badges/lencana-pahlawan.svg' WHERE "levelMilestone" = 10;
UPDATE "Badge" SET "imageUrl" = '/badges/lencana-pemula.svg' WHERE "imageUrl" IS NULL;

ALTER TABLE "Badge" ALTER COLUMN "imageUrl" SET NOT NULL;

-- AlterTable StudentProfile: active badge slot
ALTER TABLE "StudentProfile" ADD COLUMN "activeBadgeId" TEXT;

-- CreateTable StudentBadge (inventory lencana)
CREATE TABLE "StudentBadge" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentBadge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudentBadge_studentId_badgeId_key" ON "StudentBadge"("studentId", "badgeId");
CREATE INDEX "StudentBadge_studentId_idx" ON "StudentBadge"("studentId");

ALTER TABLE "StudentBadge" ADD CONSTRAINT "StudentBadge_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentBadge" ADD CONSTRAINT "StudentBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_activeBadgeId_fkey" FOREIGN KEY ("activeBadgeId") REFERENCES "Badge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill lencana untuk siswa yang sudah memenuhi level
INSERT INTO "StudentBadge" ("id", "studentId", "badgeId", "earnedAt")
SELECT
    'sb_' || sp."id" || '_' || b."id",
    sp."id",
    b."id",
    NOW()
FROM "StudentProfile" sp
CROSS JOIN "Badge" b
WHERE b."levelMilestone" <= sp."currentLevel"
ON CONFLICT ("studentId", "badgeId") DO NOTHING;