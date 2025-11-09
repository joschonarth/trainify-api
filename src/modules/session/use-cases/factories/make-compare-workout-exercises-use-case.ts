import { PrismaWorkoutSessionsRepository } from '../../repositories/prisma/prisma-workout-sessions.repository'
import { CompareWorkoutExercisesUseCase } from '../compare-workout-exercises.use-case'

export function makeCompareWorkoutExercisesUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const compareWorkoutExercisesUseCase = new CompareWorkoutExercisesUseCase(
    workoutSessionsRepository,
  )

  return compareWorkoutExercisesUseCase
}
