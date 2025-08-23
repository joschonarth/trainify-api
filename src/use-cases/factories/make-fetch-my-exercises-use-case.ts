import { PrismaMyExercisesRepository } from '@/repositories/prisma/prisma-my-exercises.repository'

import { FetchMyExercisesUseCase } from '../fetch-my-exercises.use-case'

export function makeFetchMyExercisesUseCase() {
  const myExercisesRepository = new PrismaMyExercisesRepository()
  const useCase = new FetchMyExercisesUseCase(myExercisesRepository)

  return useCase
}
