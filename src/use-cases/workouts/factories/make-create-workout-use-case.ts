import { PrismaWorkoutsRepository } from '@/repositories/prisma/prisma-workouts.repository'

import { CreateWorkoutUseCase } from '../create-workout.use-case'

export function makeCreateWorkoutUseCase() {
  const workoutsRepository = new PrismaWorkoutsRepository()
  const useCase = new CreateWorkoutUseCase(workoutsRepository)

  return useCase
}
