-- AlterTable
ALTER TABLE "buyer_profiles" ADD COLUMN IF NOT EXISTS "notifyNewArtworks" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "buyer_profiles" ADD COLUMN IF NOT EXISTS "notifyPriceDrops" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "buyer_profiles" ADD COLUMN IF NOT EXISTS "notifyArtistNews" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "buyer_profiles" ADD COLUMN IF NOT EXISTS "notifyNewsletter" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "buyer_profiles" ADD COLUMN IF NOT EXISTS "notifyOrderUpdates" BOOLEAN NOT NULL DEFAULT true;
