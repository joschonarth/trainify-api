import { makeUnlockAllBadgesUseCase } from '@/modules/gamification/use-cases/factories/make-unlock-all-badges-use-case'
import { makeUpdateUserStreakUseCase } from '@/modules/gamification/use-cases/factories/make-update-user-streak-use-case'
import { PrismaExerciseLogsRepository } from '@/repositories/prisma/prisma-exercise-logs.repository'
import { PrismaExerciseSessionsRepository } from '@/repositories/prisma/prisma-exercise-sessions.repository'
import { PrismaWorkoutSessionsRepository } from '@/repositories/prisma/prisma-workout-sessions.repository'

import { CompleteWorkoutSessionUseCase } from '../complete-workout-session.use-case'

export function makeCompleteWorkoutSessionUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const exerciseSessionsRepository = new PrismaExerciseSessionsRepository()
  const exerciseLogsRepository = new PrismaExerciseLogsRepository()

  const updateUserStreakUseCase = makeUpdateUserStreakUseCase()
  const unlockAllBadgesUseCase = makeUnlockAllBadgesUseCase()

  const completeWorkoutSessionUseCase = new CompleteWorkoutSessionUseCase(
    workoutSessionsRepository,
    exerciseSessionsRepository,
    exerciseLogsRepository,

    updateUserStreakUseCase,
    unlockAllBadgesUseCase,
  )

  return completeWorkoutSessionUseCase
}
