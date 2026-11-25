CREATE TYPE "NotificationType" AS ENUM ('BADGE_UNLOCKED');

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "eventId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "notifications_recipientId_eventId_key" ON "notifications"("recipientId", "eventId");
CREATE INDEX "notifications_recipientId_createdAt_id_idx" ON "notifications"("recipientId", "createdAt" DESC, "id" DESC);
CREATE INDEX "notifications_recipientId_readAt_createdAt_id_idx" ON "notifications"("recipientId", "readAt", "createdAt" DESC, "id" DESC);

CREATE TABLE "badge_notification_deliveries" (
    "eventId" UUID NOT NULL,
    "attempts" INTEGER NOT NULL,
    "attemptToken" UUID NOT NULL,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL,
    "failure" TEXT,
    CONSTRAINT "badge_notification_deliveries_pkey" PRIMARY KEY ("eventId")
);

CREATE TABLE "badge_notification_replays" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "operator" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "badge_notification_replays_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "badge_notification_replays_eventId_createdAt_idx" ON "badge_notification_replays"("eventId", "createdAt");
