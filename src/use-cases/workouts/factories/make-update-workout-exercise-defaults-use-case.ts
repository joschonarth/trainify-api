import { PrismaWorkoutExercisesRepository } from '@/repositories/prisma/prisma-workout-exercises.repository'

import { UpdateWorkoutExerciseDefaultsUseCase } from '../update-workout-exercise-defaults.use-case'

export function makeUpdateWorkoutExerciseDefaultsUseCase() {
  const workoutExercisesRepository = new PrismaWorkoutExercisesRepository()
  const useCase = new UpdateWorkoutExerciseDefaultsUseCase(
    workoutExercisesRepository,
  )

  return useCase
}
