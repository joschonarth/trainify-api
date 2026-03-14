import { PrismaExerciseSessionsRepository } from '../../repositories/prisma/prisma-exercise-sessions.repository'
import { PrismaWorkoutSessionsRepository } from '../../repositories/prisma/prisma-workout-sessions.repository'
import { StartExerciseTimerUseCase } from '../start-exercise-timer.use-case'

export function makeStartExerciseTimerUseCase() {
  const exerciseSessionsRepository = new PrismaExerciseSessionsRepository()
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const startExerciseTimerUseCase = new StartExerciseTimerUseCase(
    exerciseSessionsRepository,
    workoutSessionsRepository
  )

  return startExerciseTimerUseCase
}
