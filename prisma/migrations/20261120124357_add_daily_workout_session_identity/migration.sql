-- CreateTable
CREATE TABLE "daily_workout_sessions" (
    "userId" TEXT NOT NULL,
    "businessDate" VARCHAR(10) NOT NULL,
    "timezone" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "daily_workout_sessions_pkey" PRIMARY KEY ("userId","businessDate")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_workout_sessions_sessionId_key" ON "daily_workout_sessions"("sessionId");

-- AddForeignKey
ALTER TABLE "daily_workout_sessions" ADD CONSTRAINT "daily_workout_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_workout_sessions" ADD CONSTRAINT "daily_workout_sessions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
