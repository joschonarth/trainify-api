import { PrismaExerciseTimerUnitOfWork } from '../../repositories/prisma/prisma-exercise-timer-unit-of-work'
import { StopExerciseTimerUseCase } from '../stop-exercise-timer.use-case'

export function makeStopExerciseTimerUseCase() {
  const unitOfWork = new PrismaExerciseTimerUnitOfWork()
  const stopExerciseTimerUseCase = new StopExerciseTimerUseCase(unitOfWork)

  return stopExerciseTimerUseCase
}
