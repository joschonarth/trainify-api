import { PrismaExerciseLogsRepository } from '@/repositories/prisma/prisma-exercise-logs.repository'
import { PrismaWorkoutSessionsRepository } from '@/repositories/prisma/prisma-workout-sessions.repository'

import { CreateExerciseLogSessionUseCase } from '../create-exercise-log-session.use-case'

export function makeCreateExerciseLogSessionUseCase() {
  const exerciseLogsRepository = new PrismaExerciseLogsRepository()
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const useCase = new CreateExerciseLogSessionUseCase(
    exerciseLogsRepository,
    workoutSessionsRepository,
  )

  return useCase
}
