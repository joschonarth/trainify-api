import { PrismaMyExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-my-exercises.repository'

import { SetExerciseFavoriteUseCase } from '../set-exercise-favorite.use-case'

export function makeSetExerciseFavoriteUseCase() {
  const myExercisesRepository = new PrismaMyExercisesRepository()
  const setExerciseFavoriteUseCase = new SetExerciseFavoriteUseCase(
    myExercisesRepository
  )

  return setExerciseFavoriteUseCase
}
