import { PrismaExerciseLogsRepository } from '@/modules/exercise/repositories/prisma/prisma-exercise-logs.repository'
import { PrismaWorkoutSessionsRepository } from '@/repositories/prisma/prisma-workout-sessions.repository'

import { GetUserMetricsUseCase } from '../get-user-metrics.use-case'

export function makeGetUserMetricsUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const exerciseLogsRepository = new PrismaExerciseLogsRepository()
  const getUserMetricsUseCase = new GetUserMetricsUseCase(
    workoutSessionsRepository,
    exerciseLogsRepository,
  )

  return getUserMetricsUseCase
}
