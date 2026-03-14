import { PrismaWorkoutsRepository } from '../../repositories/prisma/prisma-workouts.repository'
import { GetWorkoutDetailsUseCase } from '../get-workout-details.use-case'

export function makeGetWorkoutDetailsUseCase() {
  const workoutsRepository = new PrismaWorkoutsRepository()
  const getWorkoutDetailsUseCase = new GetWorkoutDetailsUseCase(
    workoutsRepository
  )

  return getWorkoutDetailsUseCase
}
