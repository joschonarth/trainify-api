import { PrismaWorkoutsRepository } from '@/repositories/prisma/prisma-workouts.repository'

import { GetWorkoutDetailsUseCase } from '../get-workout-details.use-case'

export function makeGetWorkoutDetailsUseCase() {
  const workoutsRepository = new PrismaWorkoutsRepository()
  const useCase = new GetWorkoutDetailsUseCase(workoutsRepository)

  return useCase
}
