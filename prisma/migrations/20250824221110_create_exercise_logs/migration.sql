-- CreateTable
CREATE TABLE "exercise_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" REAL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "workoutId" TEXT,
    CONSTRAINT "exercise_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "exercise_logs_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
