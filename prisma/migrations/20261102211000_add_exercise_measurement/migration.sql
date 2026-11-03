CREATE TYPE "Measurement" AS ENUM ('REPS', 'DURATION');

ALTER TABLE "exercises"
ADD COLUMN "measurement" "Measurement" NOT NULL DEFAULT 'REPS';
