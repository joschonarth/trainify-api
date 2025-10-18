-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_weight_goals" (
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
INSERT INTO "new_weight_goals" ("achievedAt", "createdAt", "description", "endDate", "goalType", "id", "isActive", "name", "progress", "startDate", "startWeight", "targetWeight", "updatedAt", "userId") SELECT "achievedAt", "createdAt", "description", "endDate", "goalType", "id", "isActive", "name", "progress", "startDate", "startWeight", "targetWeight", "updatedAt", "userId" FROM "weight_goals";
DROP TABLE "weight_goals";
ALTER TABLE "new_weight_goals" RENAME TO "weight_goals";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
