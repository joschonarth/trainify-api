import { PrismaWorkoutsRepository } from '../../repositories/prisma/prisma-workouts.repository'
import { CreateWorkoutUseCase } from '../create-workout.use-case'

export function makeCreateWorkoutUseCase() {
  const workoutsRepository = new PrismaWorkoutsRepository()
  const createWorkoutUseCase = new CreateWorkoutUseCase(workoutsRepository)

  return createWorkoutUseCase
}
