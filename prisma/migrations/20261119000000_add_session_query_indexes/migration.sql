-- CreateIndex
CREATE INDEX "workout_sessions_userId_date_idx" ON "workout_sessions"("userId", "date");

-- CreateIndex
CREATE INDEX "exercise_sessions_exerciseId_idx" ON "exercise_sessions"("exerciseId");

-- CreateIndex
CREATE INDEX "exercise_logs_userId_exerciseId_date_idx" ON "exercise_logs"("userId", "exerciseId", "date");
