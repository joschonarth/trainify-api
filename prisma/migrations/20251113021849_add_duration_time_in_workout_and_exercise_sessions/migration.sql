-- AlterTable
ALTER TABLE "exercise_sessions" ADD COLUMN "duration" INTEGER;
ALTER TABLE "exercise_sessions" ADD COLUMN "ended_at" DATETIME;
ALTER TABLE "exercise_sessions" ADD COLUMN "started_at" DATETIME;

-- AlterTable
ALTER TABLE "workout_sessions" ADD COLUMN "duration" INTEGER;
ALTER TABLE "workout_sessions" ADD COLUMN "ended_at" DATETIME;
ALTER TABLE "workout_sessions" ADD COLUMN "started_at" DATETIME;
