import { PrismaExerciseSessionsRepository } from '@/modules/session/repositories/prisma/prisma-exercise-sessions.repository'
import { PrismaWorkoutSessionsRepository } from '@/modules/session/repositories/prisma/prisma-workout-sessions.repository'

import { GetExerciseSessionDetailsUseCase } from '../get-exercise-session-details.use-case'

export function makeGetExerciseSessionDetailsUseCase() {
  const exerciseSessionsRepository = new PrismaExerciseSessionsRepository()
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()

  const getExerciseSessionDetailsUseCase = new GetExerciseSessionDetailsUseCase(
    exerciseSessionsRepository,
    workoutSessionsRepository
  )

  return getExerciseSessionDetailsUseCase
}
