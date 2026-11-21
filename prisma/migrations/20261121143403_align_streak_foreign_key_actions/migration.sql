-- DropForeignKey
ALTER TABLE "streak_plans" DROP CONSTRAINT "streak_plans_userId_fkey";

-- DropForeignKey
ALTER TABLE "streak_tracking" DROP CONSTRAINT "streak_tracking_userId_fkey";

-- AddForeignKey
ALTER TABLE "streak_tracking" ADD CONSTRAINT "streak_tracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streak_plans" ADD CONSTRAINT "streak_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "streak_tracking"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
