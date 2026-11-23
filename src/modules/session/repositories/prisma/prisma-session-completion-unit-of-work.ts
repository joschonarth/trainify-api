import type { PrismaClient } from 'generated/prisma'
import { prisma } from '@/lib/prisma'
import { PrismaExerciseLogsRepository } from '@/modules/exercise/repositories/prisma/prisma-exercise-logs.repository'

import type {
  SessionCompletionRepositories,
  SessionCompletionUnitOfWork,
} from '../session-completion-unit-of-work'
import { PrismaExerciseSessionsRepository } from './prisma-exercise-sessions.repository'
import { PrismaWorkoutSessionCompletionsRepository } from './prisma-workout-session-completions.repository'
import { PrismaWorkoutSessionsRepository } from './prisma-workout-sessions.repository'

export class PrismaSessionCompletionUnitOfWork
  implements SessionCompletionUnitOfWork
{
  constructor(private readonly client: PrismaClient = prisma) {}
  async execute<T>(
    sessionId: string,
    operation: (repositories: SessionCompletionRepositories) => Promise<T>
  ): Promise<T> {
    return await this.client.$transaction(async (transaction) => {
      // Match timer lock order and serialize completion retries before reading state.
      await transaction.$queryRaw`SELECT id FROM workout_sessions WHERE id = ${sessionId} FOR UPDATE`
      await transaction.$queryRaw`SELECT id FROM exercise_sessions WHERE "workoutSessionId" = ${sessionId} ORDER BY id FOR UPDATE`
      const workoutSessions = new PrismaWorkoutSessionsRepository(transaction)
      const exerciseSessions = new PrismaExerciseSessionsRepository(transaction)
      const exerciseLogs = new PrismaExerciseLogsRepository(transaction)
      const completions = new PrismaWorkoutSessionCompletionsRepository(
        transaction
      )
      return await operation({
        workoutSessions,
        exerciseSessions,
        exerciseLogs,
        completions,
        outbox: {
          async create(event) {
            await transaction.sessionEventOutbox.create({
              data: {
                eventId: event.eventId,
                type: event.type,
                sessionId: event.data.sessionId,
                envelope: event,
              },
            })
          },
        },
        processings: {
          async createPending(identity) {
            await transaction.sessionEventProcessing.create({ data: identity })
          },
        },
      })
    })
  }
}
