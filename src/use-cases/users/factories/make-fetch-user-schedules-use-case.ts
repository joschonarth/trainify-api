import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users.repository'
import { PrismaWorkoutsRepository } from '@/repositories/prisma/prisma-workouts.repository'

import { FetchUserSchedulesUseCase } from '../fetch-user-schedules.use-case'

export function makeFetchUserSchedulesUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const workoutsRepository = new PrismaWorkoutsRepository()
  const useCase = new FetchUserSchedulesUseCase(
    usersRepository,
    workoutsRepository,
  )

  return useCase
}
