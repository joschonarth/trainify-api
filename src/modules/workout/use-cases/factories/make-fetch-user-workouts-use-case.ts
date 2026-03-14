import { PrismaWorkoutsRepository } from '../../repositories/prisma/prisma-workouts.repository'
import { FetchUserWorkoutsUseCase } from '../fetch-user-workouts.use-case'

export function makeFetchUserWorkoutsUseCase() {
  const workoutsRepository = new PrismaWorkoutsRepository()
  const fetchUserWorkoutsUseCase = new FetchUserWorkoutsUseCase(
    workoutsRepository
  )

  return fetchUserWorkoutsUseCase
}
