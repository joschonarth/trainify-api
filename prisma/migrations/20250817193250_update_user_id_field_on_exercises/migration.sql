/*
  Warnings:

  - You are about to drop the column `userId` on the `exercises` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "type" TEXT,
    "sets" INTEGER,
    "reps" INTEGER,
    "weight" REAL,
    "is_custom" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    CONSTRAINT "exercises_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_exercises" ("category", "created_at", "id", "is_custom", "name", "reps", "sets", "type", "weight") SELECT "category", "created_at", "id", "is_custom", "name", "reps", "sets", "type", "weight" FROM "exercises";
DROP TABLE "exercises";
ALTER TABLE "new_exercises" RENAME TO "exercises";
CREATE UNIQUE INDEX "exercises_name_key" ON "exercises"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
