-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_workout_exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "defaultSets" INTEGER,
    "defaultReps" INTEGER,
    "defaultWeight" REAL,
    CONSTRAINT "workout_exercises_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "workout_exercises_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_workout_exercises" ("defaultReps", "defaultSets", "defaultWeight", "exerciseId", "id", "workoutId") SELECT "defaultReps", "defaultSets", "defaultWeight", "exerciseId", "id", "workoutId" FROM "workout_exercises";
DROP TABLE "workout_exercises";
ALTER TABLE "new_workout_exercises" RENAME TO "workout_exercises";
CREATE UNIQUE INDEX "workout_exercises_workoutId_exerciseId_key" ON "workout_exercises"("workoutId", "exerciseId");
CREATE TABLE "new_workout_schedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    CONSTRAINT "workout_schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "workout_schedule_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_workout_schedule" ("dayOfWeek", "id", "userId", "workoutId") SELECT "dayOfWeek", "id", "userId", "workoutId" FROM "workout_schedule";
DROP TABLE "workout_schedule";
ALTER TABLE "new_workout_schedule" RENAME TO "workout_schedule";
CREATE UNIQUE INDEX "workout_schedule_userId_dayOfWeek_key" ON "workout_schedule"("userId", "dayOfWeek");
CREATE TABLE "new_workout_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "started_at" DATETIME,
    "ended_at" DATETIME,
    "duration" INTEGER,
    "userId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    CONSTRAINT "workout_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "workout_sessions_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_workout_sessions" ("date", "duration", "ended_at", "id", "started_at", "status", "userId", "workoutId") SELECT "date", "duration", "ended_at", "id", "started_at", "status", "userId", "workoutId" FROM "workout_sessions";
DROP TABLE "workout_sessions";
ALTER TABLE "new_workout_sessions" RENAME TO "workout_sessions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
