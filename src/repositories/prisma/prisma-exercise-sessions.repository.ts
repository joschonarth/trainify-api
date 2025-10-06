import { ExerciseSession, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import {
  ExerciseSessionsRepository,
  ExerciseSessionWithLogs,
} from '../exercise-sessions.repository'

export class PrismaExerciseSessionsRepository
  implements ExerciseSessionsRepository
{
  async findById(id: string): Promise<ExerciseSession | null> {
    return prisma.exerciseSession.findUnique({ where: { id } })
  }

  async findByWorkoutSessionId(
    workoutSessionId: string,
  ): Promise<ExerciseSessionWithLogs[]> {
    return prisma.exerciseSession.findMany({
      where: { workoutSessionId },
      include: {
        exercise: true,
        logs: true,
      },
    }) as unknown as ExerciseSessionWithLogs[]
  }

  async findByIdWithLogs(id: string): Promise<ExerciseSessionWithLogs | null> {
    return prisma.exerciseSession.findUnique({
      where: { id },
      include: {
        exercise: true,
        logs: true,
      },
    }) as unknown as ExerciseSessionWithLogs | null
  }

  async create(
    data: Prisma.ExerciseSessionUncheckedCreateInput,
  ): Promise<ExerciseSession> {
    return prisma.exerciseSession.create({ data })
  }

  async update(
    data: Prisma.ExerciseSessionUncheckedUpdateInput & { id: string },
  ): Promise<ExerciseSession> {
    const { id, ...updateData } = data
    return prisma.exerciseSession.update({
      where: { id },
      data: updateData,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.exerciseSession.delete({ where: { id } })
  }
}
