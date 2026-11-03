DROP INDEX "exercises_name_user_id_key";

CREATE UNIQUE INDEX "exercises_user_name_unique"
ON "exercises" ("user_id", lower("name"))
WHERE "user_id" IS NOT NULL AND "archived_at" IS NULL;

CREATE UNIQUE INDEX "exercises_catalog_name_unique"
ON "exercises" (lower("name"))
WHERE "user_id" IS NULL;
