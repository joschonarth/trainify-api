import type { ExerciseSession, Prisma } from 'generated/prisma'

import { prisma } from '@/lib/prisma'

import type {
  ExerciseSessionsRepository,
  ExerciseSessionWithLogs,
} from '../exercise-sessions.repository'

export class PrismaExerciseSessionsRepository
  implements ExerciseSessionsRepository
{
  async findById(id: string): Promise<ExerciseSession | null> {
    return await prisma.exerciseSession.findUnique({ where: { id } })
  }

  async findBySessionId(sessionId: string): Promise<ExerciseSessionWithLogs[]> {
    return (await prisma.exerciseSession.findMany({
      where: { workoutSessionId: sessionId },
      include: {
        exercise: true,
        logs: true,
      },
    })) as unknown as ExerciseSessionWithLogs[]
  }

  async findByWorkoutSessionId(
    workoutSessionId: string
  ): Promise<ExerciseSessionWithLogs[]> {
    return (await prisma.exerciseSession.findMany({
      where: { workoutSessionId },
      include: {
        exercise: true,
        logs: true,
      },
    })) as unknown as ExerciseSessionWithLogs[]
  }

  async findByIdWithLogs(id: string): Promise<ExerciseSessionWithLogs | null> {
    return (await prisma.exerciseSession.findUnique({
      where: { id },
      include: {
        exercise: true,
        logs: true,
      },
    })) as unknown as ExerciseSessionWithLogs | null
  }

  async findManyByUserAndExercise(
    userId: string,
    exerciseId: string,
    fromDate: Date
  ): Promise<ExerciseSessionWithLogs[]> {
    return (await prisma.exerciseSession.findMany({
      where: {
        exerciseId,
        logs: {
          some: {
            userId,
          },
        },
        ...(fromDate && { startedAt: { gte: fromDate } }),
      },
      include: {
        exercise: true,
        logs: true,
      },
    })) as unknown as ExerciseSessionWithLogs[]
  }

  async create(
    data: Prisma.ExerciseSessionUncheckedCreateInput
  ): Promise<ExerciseSession> {
    return await prisma.exerciseSession.create({ data })
  }

  async update(
    id: string,
    data: Prisma.ExerciseSessionUncheckedUpdateInput
  ): Promise<ExerciseSession> {
    return await prisma.exerciseSession.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.exerciseSession.delete({ where: { id } })
  }
}
