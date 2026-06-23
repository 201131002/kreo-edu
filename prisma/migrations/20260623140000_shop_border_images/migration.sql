-- DropForeignKey if we add one - activeBorderId had no FK before

-- Add new column
ALTER TABLE "ShopItem" ADD COLUMN "borderImageUrl" TEXT;

-- Migrate existing CSS borders to default frame images
UPDATE "ShopItem" SET "borderImageUrl" = '/borders/border-sky.svg' WHERE "borderCssClass" = 'border-sky-400';
UPDATE "ShopItem" SET "borderImageUrl" = '/borders/border-gold.svg' WHERE "borderCssClass" = 'border-amber-400';
UPDATE "ShopItem" SET "borderImageUrl" = '/borders/border-violet.svg' WHERE "borderCssClass" = 'border-violet-400';
UPDATE "ShopItem" SET "borderImageUrl" = '/borders/border-sky.svg' WHERE "borderImageUrl" IS NULL;

ALTER TABLE "ShopItem" ALTER COLUMN "borderImageUrl" SET NOT NULL;
ALTER TABLE "ShopItem" DROP COLUMN "borderCssClass";

-- Link equipped borders to shop items
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_activeBorderId_fkey" FOREIGN KEY ("activeBorderId") REFERENCES "ShopItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;