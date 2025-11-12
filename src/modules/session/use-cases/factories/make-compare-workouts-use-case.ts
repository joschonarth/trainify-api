import { PrismaWorkoutSessionsRepository } from '../../repositories/prisma/prisma-workout-sessions.repository'
import { CompareWorkoutsUseCase } from '../compare-workouts.use-case'

export function makeCompareWorkoutsUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const compareWorkoutsUseCase = new CompareWorkoutsUseCase(
    workoutSessionsRepository,
  )

  return compareWorkoutsUseCase
}
