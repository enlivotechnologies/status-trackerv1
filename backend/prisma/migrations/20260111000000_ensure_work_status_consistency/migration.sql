-- Ensure work status and completedAt are consistent
-- A work is pending if: status = PENDING AND completedAt IS NULL
-- A work is completed if: status = COMPLETED AND completedAt IS NOT NULL

-- Fix works with status = COMPLETED but completedAt is NULL
UPDATE "works" 
SET "completedAt" = "updatedAt"
WHERE "status" = 'COMPLETED' 
  AND "completedAt" IS NULL;

-- Fix works with status = PENDING but completedAt is NOT NULL
UPDATE "works" 
SET "completedAt" = NULL
WHERE "status" = 'PENDING' 
  AND "completedAt" IS NOT NULL;

-- Add a check constraint to ensure data consistency (optional, can be added if needed)
-- ALTER TABLE "works" ADD CONSTRAINT "works_status_completed_at_check" 
-- CHECK (
--   ("status" = 'PENDING' AND "completedAt" IS NULL) OR
--   ("status" = 'COMPLETED' AND "completedAt" IS NOT NULL)
-- );
