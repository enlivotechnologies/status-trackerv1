-- CreateEnum
CREATE TYPE "CollegeStatus" AS ENUM ('NEW', 'CONTACTED', 'SEMINAR_SCHEDULED', 'SEMINAR_DONE', 'CONVERTED', 'NOT_INTERESTED');

-- CreateEnum
CREATE TYPE "CollegeFollowUpStatus" AS ENUM ('PENDING', 'SELECT_DATE', 'COMPLETED', 'NOT_INTERESTED', 'INTERESTED', 'FOLLOW_UP_LATER', 'NOT_RESPONDING');

-- CreateTable
CREATE TABLE "colleges" (
    "id" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "seminarDate" TIMESTAMP(3),
    "followUpDate" TIMESTAMP(3) NOT NULL,
    "status" "CollegeStatus" NOT NULL DEFAULT 'NEW',
    "followUpStatus" "CollegeFollowUpStatus" DEFAULT 'PENDING',
    "lastContactedDate" TIMESTAMP(3),
    "assignedToId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colleges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_notes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "college_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_works" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" "WorkStatus" NOT NULL DEFAULT 'PENDING',
    "assignedToId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "college_works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_activity_logs" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "college_activity_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "colleges" ADD CONSTRAINT "colleges_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_notes" ADD CONSTRAINT "college_notes_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_works" ADD CONSTRAINT "college_works_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_works" ADD CONSTRAINT "college_works_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_activity_logs" ADD CONSTRAINT "college_activity_logs_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
