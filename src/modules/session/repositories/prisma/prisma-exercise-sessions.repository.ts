import type { ExerciseSession, Prisma, PrismaClient } from 'generated/prisma'

import { prisma } from '@/lib/prisma'
import type {
  ExerciseSessionsRepository,
  ExerciseSessionWithLogs,
} from '../exercise-sessions.repository'
import { exerciseSessionWithLogsInclude } from '../includes/exercise-session.include'

export class PrismaExerciseSessionsRepository
  implements ExerciseSessionsRepository
{
  constructor(
    private readonly client: Prisma.TransactionClient | PrismaClient = prisma
  ) {}

  async countCompletedByUser(userId: string): Promise<number> {
    return await this.client.exerciseSession.count({
      where: {
        completed: true,
        workoutSession: { userId },
      },
    })
  }

  async findById(id: string): Promise<ExerciseSession | null> {
    return await this.client.exerciseSession.findUnique({ where: { id } })
  }

  async findBySessionId(sessionId: string): Promise<ExerciseSessionWithLogs[]> {
    return await this.client.exerciseSession.findMany({
      where: { workoutSessionId: sessionId },
      include: exerciseSessionWithLogsInclude,
    })
  }

  async findByWorkoutSessionId(
    workoutSessionId: string
  ): Promise<ExerciseSessionWithLogs[]> {
    return await this.client.exerciseSession.findMany({
      where: { workoutSessionId },
      include: exerciseSessionWithLogsInclude,
    })
  }

  async findByIdWithLogs(id: string): Promise<ExerciseSessionWithLogs | null> {
    return await this.client.exerciseSession.findUnique({
      where: { id },
      include: exerciseSessionWithLogsInclude,
    })
  }

  async findManyByUserAndExercise(
    userId: string,
    exerciseId: string,
    fromDate?: Date
  ): Promise<ExerciseSessionWithLogs[]> {
    return await this.client.exerciseSession.findMany({
      where: {
        exerciseId,
        logs: {
          some: {
            userId,
          },
        },
        ...(fromDate && { startedAt: { gte: fromDate } }),
      },
      include: exerciseSessionWithLogsInclude,
    })
  }

  async create(
    data: Prisma.ExerciseSessionUncheckedCreateInput
  ): Promise<ExerciseSession> {
    return await this.client.exerciseSession.create({ data })
  }

  async update(
    id: string,
    data: Prisma.ExerciseSessionUncheckedUpdateInput
  ): Promise<ExerciseSession> {
    return await this.client.exerciseSession.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.client.exerciseSession.delete({ where: { id } })
  }
}
