import { PrismaWorkoutsRepository } from '../../repositories/prisma/prisma-workouts.repository'
import { UpdateWorkoutUseCase } from '../update-workout.use-case'

export function makeUpdateWorkoutUseCase() {
  const workoutsRepository = new PrismaWorkoutsRepository()
  const updateWorkoutUseCase = new UpdateWorkoutUseCase(workoutsRepository)

  return updateWorkoutUseCase
}
