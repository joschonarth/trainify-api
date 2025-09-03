/*
  Warnings:

  - A unique constraint covering the columns `[workoutId,exerciseId]` on the table `workout_exercises` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "workout_exercises_workoutId_exerciseId_key" ON "workout_exercises"("workoutId", "exerciseId");
