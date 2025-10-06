import { PrismaExerciseLogsRepository } from '@/repositories/prisma/prisma-exercise-logs.repository'
import { PrismaExerciseSessionsRepository } from '@/repositories/prisma/prisma-exercise-sessions.repository'
import { PrismaWorkoutSessionsRepository } from '@/repositories/prisma/prisma-workout-sessions.repository'

import { CompleteWorkoutSessionUseCase } from '../complete-workout-session.use-case'

export function makeCompleteWorkoutSessionUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const exerciseSessionsRepository = new PrismaExerciseSessionsRepository()
  const exerciseLogsRepository = new PrismaExerciseLogsRepository()
  const useCase = new CompleteWorkoutSessionUseCase(
    workoutSessionsRepository,
    exerciseSessionsRepository,
    exerciseLogsRepository,
  )

  return useCase
}
