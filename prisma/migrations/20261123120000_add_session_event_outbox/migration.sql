-- CreateEnum
CREATE TYPE "SessionEventPublicationStatus" AS ENUM ('PENDING', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "SessionEventProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "session_event_outbox" (
    "eventId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "envelope" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SessionEventPublicationStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaseToken" UUID,
    "leaseUntil" TIMESTAMP(3),
    "lastError" TEXT,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "session_event_outbox_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "session_event_processings" (
    "eventId" UUID NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SessionEventProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "leaseToken" UUID,
    "leaseUntil" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "unlockedBadges" JSONB,

    CONSTRAINT "session_event_processings_pkey" PRIMARY KEY ("eventId")
);

-- CreateIndex
CREATE INDEX "session_event_outbox_status_nextAttemptAt_leaseUntil_idx" ON "session_event_outbox"("status", "nextAttemptAt", "leaseUntil");

-- CreateIndex
CREATE UNIQUE INDEX "session_event_outbox_type_sessionId_key" ON "session_event_outbox"("type", "sessionId");

-- CreateIndex
CREATE INDEX "session_event_processings_status_leaseUntil_idx" ON "session_event_processings"("status", "leaseUntil");
