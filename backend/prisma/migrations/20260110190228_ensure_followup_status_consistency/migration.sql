-- Ensure all leads have a followUpStatus set
-- Set PENDING for leads that don't have a followUpStatus
UPDATE "leads" 
SET "followUpStatus" = 'PENDING' 
WHERE "followUpStatus" IS NULL;

-- Ensure leads with status CLOSED have followUpStatus COMPLETED
UPDATE "leads" 
SET "followUpStatus" = 'COMPLETED' 
WHERE "status" = 'CLOSED' 
  AND ("followUpStatus" IS NULL OR "followUpStatus" != 'COMPLETED');

-- Ensure leads with followUpStatus COMPLETED have status CLOSED (unless LOST)
UPDATE "leads" 
SET "status" = 'CLOSED' 
WHERE "followUpStatus" = 'COMPLETED' 
  AND "status" != 'CLOSED' 
  AND "status" != 'LOST';
