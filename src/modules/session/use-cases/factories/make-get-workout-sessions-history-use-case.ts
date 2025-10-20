import { PrismaWorkoutSessionsRepository } from '@/modules/session/repositories/prisma/prisma-workout-sessions.repository'

import { GetWorkoutSessionsHistoryUseCase } from '../get-workout-sessions-history.use-case'

export function makeGetWorkoutSessionsHistoryUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const getWorkoutSessionsHistoryUseCase = new GetWorkoutSessionsHistoryUseCase(
    workoutSessionsRepository,
  )

  return getWorkoutSessionsHistoryUseCase
}
