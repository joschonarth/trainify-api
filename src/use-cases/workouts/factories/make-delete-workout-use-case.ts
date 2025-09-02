import { PrismaWorkoutsRepository } from '@/repositories/prisma/prisma-workouts.repository'

import { DeleteWorkoutUseCase } from '../delete-workout.use-case'

export function makeDeleteWorkoutUseCase() {
  const workoutsRepository = new PrismaWorkoutsRepository()
  const useCase = new DeleteWorkoutUseCase(workoutsRepository)

  return useCase
}
