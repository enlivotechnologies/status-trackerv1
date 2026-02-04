-- Add new lead sources
-- Note: In production, you may need to add these values differently depending on your PostgreSQL setup

-- Add new fields to Lead table for money visibility
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "expectedDealValue" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "commissionPercentage" DOUBLE PRECISION DEFAULT 2;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "expectedCommission" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "lastContactedDate" TIMESTAMP(3);

-- Create ActivityLog table
CREATE TABLE IF NOT EXISTS "activity_logs" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS "activity_logs_leadId_idx" ON "activity_logs"("leadId");
CREATE INDEX IF NOT EXISTS "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- Add foreign key constraint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_leadId_fkey" 
    FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update LeadSource enum to add new values (FACEBOOK, REFERRAL, OTHER)
-- Note: PostgreSQL enum modification requires a specific approach
DO $$ 
BEGIN
    -- Add FACEBOOK if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'FACEBOOK' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'LeadSource')) THEN
        ALTER TYPE "LeadSource" ADD VALUE 'FACEBOOK';
    END IF;
    -- Add REFERRAL if not exists  
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'REFERRAL' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'LeadSource')) THEN
        ALTER TYPE "LeadSource" ADD VALUE 'REFERRAL';
    END IF;
    -- Add OTHER if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'OTHER' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'LeadSource')) THEN
        ALTER TYPE "LeadSource" ADD VALUE 'OTHER';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
