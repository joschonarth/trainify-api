import { PrismaExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-exercises.repository'
import { PrismaMyExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-my-exercises.repository'

import { PrismaWorkoutExercisesRepository } from '../../repositories/prisma/prisma-workout-exercises.repository'
import { PrismaWorkoutsRepository } from '../../repositories/prisma/prisma-workouts.repository'
import { CreateOrAttachExerciseToWorkoutUseCase } from '../create-or-attach-exercise-to-workout.use-case'

export function makeCreateOrAttachExerciseToWorkoutUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const myExercisesRepository = new PrismaMyExercisesRepository()
  const workoutsRepository = new PrismaWorkoutsRepository()
  const workoutExercisesRepository = new PrismaWorkoutExercisesRepository()

  const useCase = new CreateOrAttachExerciseToWorkoutUseCase(
    exercisesRepository,
    myExercisesRepository,
    workoutsRepository,
    workoutExercisesRepository
  )

  return useCase
}
