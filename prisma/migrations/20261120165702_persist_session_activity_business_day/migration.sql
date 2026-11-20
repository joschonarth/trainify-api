/*
  Warnings:

  - A unique constraint covering the columns `[userId,businessDate]` on the table `user_streak_logs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "streaks" ADD COLUMN     "lastBusinessDate" VARCHAR(10);

-- AlterTable
ALTER TABLE "user_streak_logs" ADD COLUMN     "businessDate" VARCHAR(10);

-- AlterTable
ALTER TABLE "workout_session_completions" ADD COLUMN     "businessDate" VARCHAR(10),
ADD COLUMN     "timezone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_streak_logs_userId_businessDate_key" ON "user_streak_logs"("userId", "businessDate");
