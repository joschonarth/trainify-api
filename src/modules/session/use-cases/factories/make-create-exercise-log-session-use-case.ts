import { PrismaExerciseLogsRepository } from '@/modules/exercise/repositories/prisma/prisma-exercise-logs.repository'
import { PrismaWorkoutSessionsRepository } from '@/modules/session/repositories/prisma/prisma-workout-sessions.repository'

import { CreateExerciseLogSessionUseCase } from '../create-exercise-log-session.use-case'

export function makeCreateExerciseLogSessionUseCase() {
  const exerciseLogsRepository = new PrismaExerciseLogsRepository()
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const createExerciseLogSessionUseCase = new CreateExerciseLogSessionUseCase(
    exerciseLogsRepository,
    workoutSessionsRepository
  )

  return createExerciseLogSessionUseCase
}
