import { PrismaExercisesRepository } from '@/repositories/prisma/prisma-exercises.repository'
import { PrismaWorkoutExercisesRepository } from '@/repositories/prisma/prisma-workout-exercises.repository'
import { PrismaWorkoutsRepository } from '@/repositories/prisma/prisma-workouts.repository'

import { AddExerciseToWorkoutUseCase } from '../add-exercise-to-workout.use-case'

export function makeAddExerciseToWorkoutUseCase() {
  const workoutExercisesRepository = new PrismaWorkoutExercisesRepository()
  const workoutsRepository = new PrismaWorkoutsRepository()
  const exercisesRepository = new PrismaExercisesRepository()
  const useCase = new AddExerciseToWorkoutUseCase(
    workoutExercisesRepository,
    workoutsRepository,
    exercisesRepository,
  )

  return useCase
}
