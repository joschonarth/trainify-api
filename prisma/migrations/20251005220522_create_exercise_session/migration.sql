/*
  Warnings:

  - You are about to drop the column `workoutId` on the `exercise_logs` table. All the data in the column will be lost.
  - You are about to drop the column `workoutSessionId` on the `exercise_logs` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `workout_sessions` table. All the data in the column will be lost.
  - Added the required column `exerciseSessionId` to the `exercise_logs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "exercise_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "plannedSets" INTEGER,
    "plannedReps" INTEGER,
    "plannedWeight" REAL,
    "workoutSessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    CONSTRAINT "exercise_sessions_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "workout_sessions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "exercise_sessions_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "exerciseSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    CONSTRAINT "exercise_logs_exerciseSessionId_fkey" FOREIGN KEY ("exerciseSessionId") REFERENCES "exercise_sessions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "exercise_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "exercise_logs_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_exercise_logs" ("date", "description", "exerciseId", "id", "reps", "sets", "userId", "weight") SELECT "date", "description", "exerciseId", "id", "reps", "sets", "userId", "weight" FROM "exercise_logs";
DROP TABLE "exercise_logs";
ALTER TABLE "new_exercise_logs" RENAME TO "exercise_logs";
CREATE TABLE "new_workout_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    CONSTRAINT "workout_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "workout_sessions_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_workout_sessions" ("date", "id", "userId", "workoutId") SELECT "date", "id", "userId", "workoutId" FROM "workout_sessions";
DROP TABLE "workout_sessions";
ALTER TABLE "new_workout_sessions" RENAME TO "workout_sessions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "exercise_sessions_workoutSessionId_exerciseId_key" ON "exercise_sessions"("workoutSessionId", "exerciseId");
