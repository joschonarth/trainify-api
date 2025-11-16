/*
  Warnings:

  - Added the required column `userId` to the `workout_schedule` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_workout_schedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    CONSTRAINT "workout_schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "workout_schedule_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_workout_schedule" ("dayOfWeek", "id", "workoutId") SELECT "dayOfWeek", "id", "workoutId" FROM "workout_schedule";
DROP TABLE "workout_schedule";
ALTER TABLE "new_workout_schedule" RENAME TO "workout_schedule";
CREATE UNIQUE INDEX "workout_schedule_workoutId_dayOfWeek_key" ON "workout_schedule"("workoutId", "dayOfWeek");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
