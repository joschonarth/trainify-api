/*
  Warnings:

  - You are about to drop the column `workoutId` on the `exercise_logs` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_exercise_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" REAL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    CONSTRAINT "exercise_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "exercise_logs_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_exercise_logs" ("date", "description", "exerciseId", "id", "reps", "sets", "userId", "weight") SELECT "date", "description", "exerciseId", "id", "reps", "sets", "userId", "weight" FROM "exercise_logs";
DROP TABLE "exercise_logs";
ALTER TABLE "new_exercise_logs" RENAME TO "exercise_logs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
