-- AlterTable
ALTER TABLE "session_event_processings" ADD COLUMN     "nextAttemptAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "session_event_processing_replays" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "operator" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_event_processing_replays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_event_processing_replays_eventId_createdAt_idx" ON "session_event_processing_replays"("eventId", "createdAt");

-- AddForeignKey
ALTER TABLE "session_event_processing_replays" ADD CONSTRAINT "session_event_processing_replays_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "session_event_processings"("eventId") ON DELETE RESTRICT ON UPDATE CASCADE;
