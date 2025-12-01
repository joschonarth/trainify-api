-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "avatarUrl" TEXT,
    "height" INTEGER,
    "weight" REAL,
    "gender" TEXT,
    "birthdate" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "type" TEXT,
    "is_custom" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    CONSTRAINT "exercises_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "my_exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    CONSTRAINT "my_exercises_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "my_exercises_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workouts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "workouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workout_exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "defaultSets" INTEGER,
    "defaultReps" INTEGER,
    "defaultWeight" REAL,
    CONSTRAINT "workout_exercises_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "workout_exercises_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workout_schedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    CONSTRAINT "workout_schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "workout_schedule_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workout_sessions" (
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

-- CreateTable
CREATE TABLE "exercise_sessions" (
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

-- CreateTable
CREATE TABLE "exercise_logs" (
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

-- CreateTable
CREATE TABLE "streaks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastWorkout" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_streak_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_streak_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "weight_goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goalType" TEXT NOT NULL,
    "startWeight" REAL,
    "targetWeight" REAL NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "achievedAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "progress" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "weight_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "weight_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" REAL NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "weight_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "weight_logs_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "weight_goals" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "milestone" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "seed_state" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "executed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_name_user_id_key" ON "exercises"("name", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "my_exercises_userId_exerciseId_key" ON "my_exercises"("userId", "exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "workouts_name_userId_key" ON "workouts"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "workout_exercises_workoutId_exerciseId_key" ON "workout_exercises"("workoutId", "exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "workout_schedule_userId_dayOfWeek_key" ON "workout_schedule"("userId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_sessions_workoutSessionId_exerciseId_key" ON "exercise_sessions"("workoutSessionId", "exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "streaks_userId_key" ON "streaks"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_streak_logs_userId_date_key" ON "user_streak_logs"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "badges_name_key" ON "badges"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");
