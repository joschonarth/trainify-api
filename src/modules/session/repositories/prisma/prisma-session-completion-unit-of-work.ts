import { prisma } from '@/lib/prisma'
import { PrismaExerciseLogsRepository } from '@/modules/exercise/repositories/prisma/prisma-exercise-logs.repository'

import type {
  SessionCompletionRepositories,
  SessionCompletionUnitOfWork,
} from '../session-completion-unit-of-work'
import { PrismaExerciseSessionsRepository } from './prisma-exercise-sessions.repository'
import { PrismaWorkoutSessionsRepository } from './prisma-workout-sessions.repository'

export class PrismaSessionCompletionUnitOfWork
  implements SessionCompletionUnitOfWork
{
  async execute<T>(
    operation: (repositories: SessionCompletionRepositories) => Promise<T>
  ): Promise<T> {
    return await prisma.$transaction(async (transaction) => {
      return await operation({
        workoutSessions: new PrismaWorkoutSessionsRepository(transaction),
        exerciseSessions: new PrismaExerciseSessionsRepository(transaction),
        exerciseLogs: new PrismaExerciseLogsRepository(transaction),
      })
    })
  }
}
