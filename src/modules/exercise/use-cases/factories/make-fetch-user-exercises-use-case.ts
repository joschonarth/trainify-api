import { PrismaExercisesRepository } from '../../repositories/prisma/prisma-exercises.repository'
import { FetchUserExercisesUseCase } from '../fetch-user-exercises.use-case'

export function makeFetchUserExercisesUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const fetchUserExercisesUseCase = new FetchUserExercisesUseCase(
    exercisesRepository,
  )

  return fetchUserExercisesUseCase
}
