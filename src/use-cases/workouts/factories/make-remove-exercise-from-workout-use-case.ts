import { PrismaWorkoutExercisesRepository } from '@/repositories/prisma/prisma-workout-exercises.repository'

import { RemoveExerciseFromWorkoutUseCase } from '../remove-exercise-from-workout.use-case'

export function makeRemoveExerciseFromWorkoutUseCase() {
  const workoutExercisesRepository = new PrismaWorkoutExercisesRepository()
  const useCase = new RemoveExerciseFromWorkoutUseCase(
    workoutExercisesRepository,
  )

  return useCase
}
