/*
  Warnings:

  - A unique constraint covering the columns `[workoutId,dayOfWeek]` on the table `workout_schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "workout_schedule_workoutId_dayOfWeek_key" ON "workout_schedule"("workoutId", "dayOfWeek");
