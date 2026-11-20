import { PrismaStreakUnitOfWork } from '../../repositories/prisma/prisma-streak-unit-of-work'
import { RefreshUserStreakUseCase } from '../refresh-user-streak.use-case'

export function makeRefreshUserStreakUseCase() {
  const unitOfWork = new PrismaStreakUnitOfWork()
  const refreshUserStreakUseCase = new RefreshUserStreakUseCase(unitOfWork)
  return refreshUserStreakUseCase
}
