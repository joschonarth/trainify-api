/*
  Warnings:

  - A unique constraint covering the columns `[userId,dayOfWeek]` on the table `workout_schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "workout_schedule_workoutId_dayOfWeek_key";

-- CreateIndex
CREATE UNIQUE INDEX "workout_schedule_userId_dayOfWeek_key" ON "workout_schedule"("userId", "dayOfWeek");
