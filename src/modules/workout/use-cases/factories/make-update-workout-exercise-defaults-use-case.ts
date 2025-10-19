import { PrismaWorkoutExercisesRepository } from '../../repositories/prisma/prisma-workout-exercises.repository'
import { PrismaWorkoutsRepository } from '../../repositories/prisma/prisma-workouts.repository'
import { UpdateWorkoutExerciseDefaultsUseCase } from '../update-workout-exercise-defaults.use-case'

export function makeUpdateWorkoutExerciseDefaultsUseCase() {
  const workoutsRepository = new PrismaWorkoutsRepository()
  const workoutExercisesRepository = new PrismaWorkoutExercisesRepository()
  const updateWorkoutExerciseDefaultsUseCase =
    new UpdateWorkoutExerciseDefaultsUseCase(
      workoutsRepository,
      workoutExercisesRepository,
    )

  return updateWorkoutExerciseDefaultsUseCase
}
