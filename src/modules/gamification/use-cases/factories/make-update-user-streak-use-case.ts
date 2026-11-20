import { PrismaStreakUnitOfWork } from '../../repositories/prisma/prisma-streak-unit-of-work'
import { UpdateUserStreakUseCase } from '../update-user-streak.use-case'

export function makeUpdateUserStreakUseCase() {
  const unitOfWork = new PrismaStreakUnitOfWork()
  const updateUserStreakUseCase = new UpdateUserStreakUseCase(unitOfWork)
  return updateUserStreakUseCase
}
