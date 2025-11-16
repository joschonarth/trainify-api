import { PrismaExerciseSessionsRepository } from '../../repositories/prisma/prisma-exercise-sessions.repository'
import { PrismaWorkoutSessionsRepository } from '../../repositories/prisma/prisma-workout-sessions.repository'
import { StopExerciseTimerUseCase } from '../stop-exercise-timer.use-case'

export function makeStopExerciseTimerUseCase() {
  const exerciseSessionsRepository = new PrismaExerciseSessionsRepository()
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const stopExerciseTimerUseCase = new StopExerciseTimerUseCase(
    exerciseSessionsRepository,
    workoutSessionsRepository,
  )

  return stopExerciseTimerUseCase
}
