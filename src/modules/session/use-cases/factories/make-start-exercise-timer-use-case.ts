import { PrismaExerciseTimerUnitOfWork } from '../../repositories/prisma/prisma-exercise-timer-unit-of-work'
import { StartExerciseTimerUseCase } from '../start-exercise-timer.use-case'

export function makeStartExerciseTimerUseCase() {
  const unitOfWork = new PrismaExerciseTimerUnitOfWork()
  const startExerciseTimerUseCase = new StartExerciseTimerUseCase(unitOfWork)

  return startExerciseTimerUseCase
}
