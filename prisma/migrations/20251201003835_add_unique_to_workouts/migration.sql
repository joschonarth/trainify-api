/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `workouts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "workouts_name_userId_key" ON "workouts"("name", "userId");
