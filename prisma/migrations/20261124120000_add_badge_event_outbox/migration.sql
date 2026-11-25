CREATE TABLE "badge_event_outbox" (
    "eventId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "userBadgeId" TEXT NOT NULL,
    "envelope" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SessionEventPublicationStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaseToken" UUID,
    "leaseUntil" TIMESTAMP(3),
    "lastError" TEXT,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "badge_event_outbox_pkey" PRIMARY KEY ("eventId")
);

CREATE UNIQUE INDEX "badge_event_outbox_type_userBadgeId_key" ON "badge_event_outbox"("type", "userBadgeId");
CREATE INDEX "badge_event_outbox_status_nextAttemptAt_leaseUntil_idx" ON "badge_event_outbox"("status", "nextAttemptAt", "leaseUntil");
