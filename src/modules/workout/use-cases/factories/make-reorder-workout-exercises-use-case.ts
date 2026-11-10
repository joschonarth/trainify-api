import { PrismaWorkoutExercisesRepository } from '../../repositories/prisma/prisma-workout-exercises.repository'
import { PrismaWorkoutsRepository } from '../../repositories/prisma/prisma-workouts.repository'
import { ReorderWorkoutExercisesUseCase } from '../reorder-workout-exercises.use-case'

export function makeReorderWorkoutExercisesUseCase() {
  const workoutsRepository = new PrismaWorkoutsRepository()
  const workoutExercisesRepository = new PrismaWorkoutExercisesRepository()
  const reorderWorkoutExercisesUseCase = new ReorderWorkoutExercisesUseCase(
    workoutsRepository,
    workoutExercisesRepository
  )

  return reorderWorkoutExercisesUseCase
}
