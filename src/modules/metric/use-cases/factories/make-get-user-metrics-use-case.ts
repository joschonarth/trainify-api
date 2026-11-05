import { PrismaExerciseSessionsRepository } from '@/modules/session/repositories/prisma/prisma-exercise-sessions.repository'
import { PrismaWorkoutSessionsRepository } from '@/modules/session/repositories/prisma/prisma-workout-sessions.repository'

import { GetUserMetricsUseCase } from '../get-user-metrics.use-case'

export function makeGetUserMetricsUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const exerciseSessionsRepository = new PrismaExerciseSessionsRepository()
  const getUserMetricsUseCase = new GetUserMetricsUseCase(
    workoutSessionsRepository,
    exerciseSessionsRepository
  )

  return getUserMetricsUseCase
}
