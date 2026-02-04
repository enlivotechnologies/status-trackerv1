-- Rename enum value from SCHEDULE_AFTER_2_DAYS to SELECT_DATE
-- Update all existing records that use SCHEDULE_AFTER_2_DAYS
UPDATE "leads"
SET "followUpStatus" = 'PENDING'
WHERE "followUpStatus" = 'SCHEDULE_AFTER_2_DAYS';

-- Alter the enum to rename the value
ALTER TYPE "FollowUpStatus" RENAME VALUE 'SCHEDULE_AFTER_2_DAYS' TO 'SELECT_DATE';
