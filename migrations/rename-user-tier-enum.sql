-- Migration: Rename UserTier enum values
-- GUEST → FREE, DIAMOND → PREMIUM, add ADMIN
-- Run this BEFORE deploying the new Prisma schema

-- Step 1: Add new enum values
ALTER TYPE "UserTier" ADD VALUE IF NOT EXISTS 'FREE';
ALTER TYPE "UserTier" ADD VALUE IF NOT EXISTS 'PREMIUM';
ALTER TYPE "UserTier" ADD VALUE IF NOT EXISTS 'ADMIN';

-- Step 2: Convert existing GUEST → FREE in all tables
UPDATE "users" SET "tier" = 'FREE'::"UserTier" WHERE "tier" = 'GUEST'::"UserTier";
UPDATE "exams" SET "min_tier" = 'FREE'::"UserTier" WHERE "min_tier" = 'GUEST'::"UserTier";
UPDATE "videos" SET "min_tier" = 'FREE'::"UserTier" WHERE "min_tier" = 'GUEST'::"UserTier";
UPDATE "payments" SET "tier" = 'FREE'::"UserTier" WHERE "tier" = 'GUEST'::"UserTier";

-- Step 3: Convert existing DIAMOND → PREMIUM
UPDATE "users" SET "tier" = 'PREMIUM'::"UserTier" WHERE "tier" = 'DIAMOND'::"UserTier";
UPDATE "exams" SET "min_tier" = 'PREMIUM'::"UserTier" WHERE "min_tier" = 'DIAMOND'::"UserTier";
UPDATE "videos" SET "min_tier" = 'PREMIUM'::"UserTier" WHERE "min_tier" = 'DIAMOND'::"UserTier";
UPDATE "payments" SET "tier" = 'PREMIUM'::"UserTier" WHERE "tier" = 'DIAMOND'::"UserTier";

-- Step 4: Update default values
ALTER TABLE "users" ALTER COLUMN "tier" SET DEFAULT 'FREE'::"UserTier";
ALTER TABLE "exams" ALTER COLUMN "min_tier" SET DEFAULT 'FREE'::"UserTier";
ALTER TABLE "videos" ALTER COLUMN "min_tier" SET DEFAULT 'FREE'::"UserTier";

-- Note: PostgreSQL does not support removing enum values directly.
-- The old values (GUEST, DIAMOND) will remain in the enum type but
-- won't be used by any rows after this migration.
-- To fully remove them, you'd need to recreate the enum type,
-- which requires dropping and recreating all columns that use it.
