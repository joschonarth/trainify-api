import { PrismaWorkoutSessionsRepository } from '@/repositories/prisma/prisma-workout-sessions.repository'

import { GetWorkoutSessionsHistoryUseCase } from '../get-workout-sessions-history.use-case'

export function makeGetWorkoutSessionsHistoryUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const useCase = new GetWorkoutSessionsHistoryUseCase(
    workoutSessionsRepository,
  )

  return useCase
}
