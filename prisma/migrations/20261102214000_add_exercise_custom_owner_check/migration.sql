ALTER TABLE "exercises"
ADD CONSTRAINT "exercises_custom_owner_chk"
CHECK (
  ("is_custom" AND "user_id" IS NOT NULL)
  OR (NOT "is_custom" AND "user_id" IS NULL)
);
