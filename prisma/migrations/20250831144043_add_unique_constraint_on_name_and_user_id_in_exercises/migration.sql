/*
  Warnings:

  - A unique constraint covering the columns `[name,user_id]` on the table `exercises` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "exercises_name_user_id_key" ON "exercises"("name", "user_id");
