-- AlterTable
ALTER TABLE "exercises" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "workouts" ADD COLUMN     "archivedAt" TIMESTAMP(3);
