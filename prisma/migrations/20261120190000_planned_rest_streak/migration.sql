CREATE TABLE "streak_tracking" (
  "userId" TEXT PRIMARY KEY REFERENCES "users"("id"),
  "timezone" TEXT NOT NULL,
  "activationDate" VARCHAR(10) NOT NULL
);
CREATE TABLE "streak_plans" (
  "userId" TEXT NOT NULL REFERENCES "streak_tracking"("userId"),
  "effectiveDate" VARCHAR(10) NOT NULL,
  "workouts" JSONB NOT NULL,
  PRIMARY KEY ("userId", "effectiveDate")
);
