import { PrismaExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-exercises.repository'
import { PrismaMyExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-my-exercises.repository'

import { PrismaWorkoutExercisesRepository } from '../../repositories/prisma/prisma-workout-exercises.repository'
import { PrismaWorkoutsRepository } from '../../repositories/prisma/prisma-workouts.repository'
import { AddExerciseToWorkoutUseCase } from '../add-exercise-to-workout.use-case'

export function makeAddExerciseToWorkoutUseCase() {
  const workoutExercisesRepository = new PrismaWorkoutExercisesRepository()
  const workoutsRepository = new PrismaWorkoutsRepository()
  const exercisesRepository = new PrismaExercisesRepository()
  const myExercisesRepository = new PrismaMyExercisesRepository()
  const addExerciseToWorkoutUseCase = new AddExerciseToWorkoutUseCase(
    workoutExercisesRepository,
    workoutsRepository,
    exercisesRepository,
    myExercisesRepository
  )

  return addExerciseToWorkoutUseCase
}
