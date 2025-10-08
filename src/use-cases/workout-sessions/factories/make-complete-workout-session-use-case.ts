import { PrismaExerciseLogsRepository } from '@/repositories/prisma/prisma-exercise-logs.repository'
import { PrismaExerciseSessionsRepository } from '@/repositories/prisma/prisma-exercise-sessions.repository'
import { PrismaUserStreaksRepository } from '@/repositories/prisma/prisma-user-streaks.repository'
import { PrismaWorkoutSessionsRepository } from '@/repositories/prisma/prisma-workout-sessions.repository'
import { UpdateUserStreakUseCase } from '@/use-cases/gamification/update-user-streak.use-case'

import { CompleteWorkoutSessionUseCase } from '../complete-workout-session.use-case'

export function makeCompleteWorkoutSessionUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const exerciseSessionsRepository = new PrismaExerciseSessionsRepository()
  const exerciseLogsRepository = new PrismaExerciseLogsRepository()
  const userStreaksRepository = new PrismaUserStreaksRepository()

  const updateUserStreakUseCase = new UpdateUserStreakUseCase(
    userStreaksRepository,
  )

  const completeWorkoutSessionUseCase = new CompleteWorkoutSessionUseCase(
    workoutSessionsRepository,
    exerciseSessionsRepository,
    exerciseLogsRepository,

    updateUserStreakUseCase,
  )

  return completeWorkoutSessionUseCase
}
