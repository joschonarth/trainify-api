import { PrismaWorkoutsRepository } from '@/repositories/prisma/prisma-workouts.repository'

import { GetWorkoutDetailsUseCase } from '../get-workout-details'

export function makeGetWorkoutDetailsUseCase() {
  const workoutsRepository = new PrismaWorkoutsRepository()
  const useCase = new GetWorkoutDetailsUseCase(workoutsRepository)

  return useCase
}
