import { PrismaMyExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-my-exercises.repository'

import { FetchMyExercisesUseCase } from '../fetch-my-exercises.use-case'

export function makeFetchMyExercisesUseCase() {
  const myExercisesRepository = new PrismaMyExercisesRepository()
  const fetchMyExercisesUseCase = new FetchMyExercisesUseCase(
    myExercisesRepository
  )

  return fetchMyExercisesUseCase
}
