import { PrismaWorkoutSessionsRepository } from '@/modules/session/repositories/prisma/prisma-workout-sessions.repository'

import { GetWorkoutSessionDetailsUseCase } from '../get-workout-session-details.use-case'

export function makeGetWorkoutSessionDetailsUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const getWorkoutSessionDetailsUseCase = new GetWorkoutSessionDetailsUseCase(
    workoutSessionsRepository
  )

  return getWorkoutSessionDetailsUseCase
}
