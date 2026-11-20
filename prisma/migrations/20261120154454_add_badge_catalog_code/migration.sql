/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `badges` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "badges" ADD COLUMN     "code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");
