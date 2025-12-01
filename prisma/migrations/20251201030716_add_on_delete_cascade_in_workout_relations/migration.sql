-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_exercise_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" REAL,
    "volume" REAL,
    "description" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exerciseSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    CONSTRAINT "exercise_logs_exerciseSessionId_fkey" FOREIGN KEY ("exerciseSessionId") REFERENCES "exercise_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "exercise_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "exercise_logs_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_exercise_logs" ("date", "description", "exerciseId", "exerciseSessionId", "id", "reps", "sets", "userId", "volume", "weight") SELECT "date", "description", "exerciseId", "exerciseSessionId", "id", "reps", "sets", "userId", "volume", "weight" FROM "exercise_logs";
DROP TABLE "exercise_logs";
ALTER TABLE "new_exercise_logs" RENAME TO "exercise_logs";
CREATE TABLE "new_exercise_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "plannedSets" INTEGER,
    "plannedReps" INTEGER,
    "plannedWeight" REAL,
    "started_at" DATETIME,
    "ended_at" DATETIME,
    "duration" INTEGER,
    "workoutSessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    CONSTRAINT "exercise_sessions_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "workout_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "exercise_sessions_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_exercise_sessions" ("completed", "duration", "ended_at", "exerciseId", "id", "plannedReps", "plannedSets", "plannedWeight", "started_at", "workoutSessionId") SELECT "completed", "duration", "ended_at", "exerciseId", "id", "plannedReps", "plannedSets", "plannedWeight", "started_at", "workoutSessionId" FROM "exercise_sessions";
DROP TABLE "exercise_sessions";
ALTER TABLE "new_exercise_sessions" RENAME TO "exercise_sessions";
CREATE UNIQUE INDEX "exercise_sessions_workoutSessionId_exerciseId_key" ON "exercise_sessions"("workoutSessionId", "exerciseId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
