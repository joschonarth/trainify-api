import { PrismaWorkoutExercisesRepository } from '@/repositories/prisma/prisma-workout-exercises.repository'
import { PrismaWorkoutsRepository } from '@/repositories/prisma/prisma-workouts.repository'

import { RemoveExerciseFromWorkoutUseCase } from '../remove-exercise-from-workout.use-case'

export function makeRemoveExerciseFromWorkoutUseCase() {
  const workoutsRepository = new PrismaWorkoutsRepository()
  const workoutExercisesRepository = new PrismaWorkoutExercisesRepository()
  const useCase = new RemoveExerciseFromWorkoutUseCase(
    workoutsRepository,
    workoutExercisesRepository,
  )

  return useCase
}
