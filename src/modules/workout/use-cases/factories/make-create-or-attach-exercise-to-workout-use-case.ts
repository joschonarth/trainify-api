import { PrismaExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-exercises.repository'

import { PrismaWorkoutExercisesRepository } from '../../repositories/prisma/prisma-workout-exercises.repository'
import { PrismaWorkoutsRepository } from '../../repositories/prisma/prisma-workouts.repository'
import { CreateOrAttachExerciseToWorkoutUseCase } from '../create-or-attach-exercise-to-workout.use-case'

export function makeCreateOrAttachExerciseToWorkoutUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const workoutsRepository = new PrismaWorkoutsRepository()
  const workoutExercisesRepository = new PrismaWorkoutExercisesRepository()

  const useCase = new CreateOrAttachExerciseToWorkoutUseCase(
    exercisesRepository,
    workoutsRepository,
    workoutExercisesRepository
  )

  return useCase
}
