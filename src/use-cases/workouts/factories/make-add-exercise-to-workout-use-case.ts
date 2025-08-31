import { PrismaWorkoutExercisesRepository } from '@/repositories/prisma/prisma-workout-exercises.repository'

import { AddExerciseToWorkoutUseCase } from '../add-exercise-to-workout.use-case'

export function makeAddExerciseToWorkoutUseCase() {
  const workoutExercisesRepository = new PrismaWorkoutExercisesRepository()
  const useCase = new AddExerciseToWorkoutUseCase(workoutExercisesRepository)

  return useCase
}
