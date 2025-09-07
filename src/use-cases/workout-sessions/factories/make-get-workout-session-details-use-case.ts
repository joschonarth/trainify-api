import { PrismaWorkoutSessionsRepository } from '@/repositories/prisma/prisma-workout-sessions.repository'

import { GetWorkoutSessionDetailsUseCase } from '../get-workout-session-details.use-case'

export function makeGetWorkoutSessionDetailsUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const useCase = new GetWorkoutSessionDetailsUseCase(workoutSessionsRepository)

  return useCase
}
