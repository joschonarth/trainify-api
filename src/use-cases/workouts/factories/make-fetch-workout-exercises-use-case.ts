import { PrismaWorkoutExercisesRepository } from '@/repositories/prisma/prisma-workout-exercises.repository'
import { PrismaWorkoutsRepository } from '@/repositories/prisma/prisma-workouts.repository'

import { FetchWorkoutExercisesUseCase } from '../fetch-workout-exercises.use-case'

export function makeFetchWorkoutExercisesUseCase() {
  const workoutsRepository = new PrismaWorkoutsRepository()
  const workoutExercisesRepository = new PrismaWorkoutExercisesRepository()
  const useCase = new FetchWorkoutExercisesUseCase(
    workoutsRepository,
    workoutExercisesRepository,
  )

  return useCase
}
