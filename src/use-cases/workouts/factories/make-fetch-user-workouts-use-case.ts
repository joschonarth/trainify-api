import { PrismaWorkoutsRepository } from '@/repositories/prisma/prisma-workouts.repository'

import { FetchUserWorkoutsUseCase } from '../fetch-user-workouts.use-case'

export function makeFetchUserWorkoutsUseCase() {
  const workoutsRepository = new PrismaWorkoutsRepository()
  const useCase = new FetchUserWorkoutsUseCase(workoutsRepository)

  return useCase
}
