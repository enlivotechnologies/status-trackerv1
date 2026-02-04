-- CreateEnum
CREATE TYPE "SeminarStatus" AS ENUM ('NOT_YET_SCHEDULED', 'WAITING_FOR_APPROVAL', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

-- DropIndex
DROP INDEX "activity_logs_createdAt_idx";

-- DropIndex
DROP INDEX "activity_logs_leadId_idx";

-- AlterTable
ALTER TABLE "colleges" ADD COLUMN     "seminarStatus" "SeminarStatus" NOT NULL DEFAULT 'NOT_YET_SCHEDULED';
