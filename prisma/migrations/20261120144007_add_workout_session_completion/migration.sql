-- CreateTable
CREATE TABLE "workout_session_completions" (
    "sessionId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "hasActivity" BOOLEAN NOT NULL,

    CONSTRAINT "workout_session_completions_pkey" PRIMARY KEY ("sessionId")
);

-- AddForeignKey
ALTER TABLE "workout_session_completions" ADD CONSTRAINT "workout_session_completions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
