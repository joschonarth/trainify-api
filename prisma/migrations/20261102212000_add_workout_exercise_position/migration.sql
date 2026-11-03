ALTER TABLE "workout_exercises"
ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

UPDATE "workout_exercises" AS we
SET "position" = sub.rn
FROM (
  SELECT
    "id",
    ROW_NUMBER() OVER (PARTITION BY "workoutId" ORDER BY "id") - 1 AS rn
  FROM "workout_exercises"
) AS sub
WHERE we."id" = sub."id";

CREATE INDEX "workout_exercises_workoutId_position_idx"
ON "workout_exercises"("workoutId", "position");
