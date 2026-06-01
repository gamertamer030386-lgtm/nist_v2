-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'END_USER');

-- CreateEnum
CREATE TYPE "ThemeMode" AS ENUM ('DAY', 'NIGHT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TASK_ASSIGNED', 'ASSESSMENT_SUBMITTED');

-- CreateEnum
CREATE TYPE "ControlCategory" AS ENUM ('PEOPLE', 'TOOLS', 'PROCESS', 'PARTNERS');

-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "EffortLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "RoadmapPhase" AS ENUM ('QUICK_WIN', 'SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'END_USER',
    "officeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "themeMode" "ThemeMode" NOT NULL DEFAULT 'DAY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Office" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NistFunction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "NistFunction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NistCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "functionId" TEXT NOT NULL,

    CONSTRAINT "NistCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NistSubcategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "implementationExamples" TEXT NOT NULL,
    "informativeReferences" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "NistSubcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "officeId" TEXT,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubcategoryScore" (
    "id" TEXT NOT NULL,
    "currentScore" SMALLINT,
    "targetScore" SMALLINT,
    "comment" TEXT,
    "assessmentId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,

    CONSTRAINT "SubcategoryScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlRecommendation" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "category" "ControlCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "priorityScore" DOUBLE PRECISION NOT NULL,
    "priorityLevel" "PriorityLevel" NOT NULL,
    "effortLevel" "EffortLevel" NOT NULL,
    "roadmapPhase" "RoadmapPhase" NOT NULL,
    "dependsOnId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ControlRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT,
    "assignedToId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "instructions" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_officeId_idx" ON "User"("officeId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Assessment_userId_createdAt_idx" ON "Assessment"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Assessment_officeId_idx" ON "Assessment"("officeId");

-- CreateIndex
CREATE INDEX "SubcategoryScore_assessmentId_idx" ON "SubcategoryScore"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "SubcategoryScore_assessmentId_subcategoryId_key" ON "SubcategoryScore"("assessmentId", "subcategoryId");

-- CreateIndex
CREATE INDEX "ControlRecommendation_assessmentId_idx" ON "ControlRecommendation"("assessmentId");

-- CreateIndex
CREATE INDEX "ControlRecommendation_assessmentId_priorityScore_idx" ON "ControlRecommendation"("assessmentId", "priorityScore" DESC);

-- CreateIndex
CREATE INDEX "TaskAssignment_assignedToId_idx" ON "TaskAssignment"("assignedToId");

-- CreateIndex
CREATE INDEX "TaskAssignment_assignedById_idx" ON "TaskAssignment"("assignedById");

-- CreateIndex
CREATE INDEX "TaskAssignment_status_idx" ON "TaskAssignment"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NistCategory" ADD CONSTRAINT "NistCategory_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "NistFunction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NistSubcategory" ADD CONSTRAINT "NistSubcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "NistCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubcategoryScore" ADD CONSTRAINT "SubcategoryScore_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubcategoryScore" ADD CONSTRAINT "SubcategoryScore_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "NistSubcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlRecommendation" ADD CONSTRAINT "ControlRecommendation_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlRecommendation" ADD CONSTRAINT "ControlRecommendation_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "NistSubcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlRecommendation" ADD CONSTRAINT "ControlRecommendation_dependsOnId_fkey" FOREIGN KEY ("dependsOnId") REFERENCES "ControlRecommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
