import type {
  Exercise,
  ExerciseLog,
  Prisma,
  PrismaClient,
} from 'generated/prisma'
import { prisma } from '@/lib/prisma'
import type { ExerciseLogsRepository } from '../exercise-logs.repository'

export class PrismaExerciseLogsRepository implements ExerciseLogsRepository {
  constructor(
    private readonly client: Prisma.TransactionClient | PrismaClient = prisma
  ) {}

  async create(data: Prisma.ExerciseLogCreateInput): Promise<ExerciseLog> {
    return await this.client.exerciseLog.create({ data })
  }

  async update(
    id: string,
    data: Prisma.ExerciseLogUpdateInput
  ): Promise<ExerciseLog> {
    return await prisma.exerciseLog.update({
      where: { id },
      data,
    })
  }

  async findAllByUser(userId: string): Promise<
    (ExerciseLog & {
      exercise: {
        id: string
        name: string
        category: Exercise['category'] | null
        type: Exercise['type'] | null
      }
    })[]
  > {
    return await prisma.exerciseLog.findMany({
      where: { userId },
      include: {
        exercise: {
          select: {
            id: true,
            name: true,
            category: true,
            type: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })
  }

  async findByUserAndExerciseBetweenDates(
    userId: string,
    exerciseId: string,
    start: Date,
    end: Date
  ): Promise<ExerciseLog | null> {
    return await prisma.exerciseLog.findFirst({
      where: {
        userId,
        exerciseId,
        date: { gte: start, lte: end },
      },
    })
  }

  async findById(id: string): Promise<
    | (ExerciseLog & {
        exercise: {
          id: string
          name: string
          category: Exercise['category'] | null
          type: Exercise['type'] | null
        }
      })
    | null
  > {
    return await prisma.exerciseLog.findUnique({
      where: { id },
      include: {
        exercise: {
          select: { id: true, name: true, category: true, type: true },
        },
      },
    })
  }

  async findByExerciseSession(
    exerciseSessionId: string
  ): Promise<ExerciseLog | null> {
    return await prisma.exerciseLog.findFirst({
      where: { exerciseSessionId },
    })
  }

  async findManyByExerciseAndUser(
    userId: string,
    exerciseId: string
  ): Promise<
    (ExerciseLog & {
      exercise: {
        id: string
        name: string
        category: Exercise['category'] | null
        type: Exercise['type'] | null
      }
    })[]
  > {
    return await prisma.exerciseLog.findMany({
      where: { userId, exerciseId },
      include: {
        exercise: {
          select: {
            id: true,
            name: true,
            category: true,
            type: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    })
  }

  async findMaxVolumeByExerciseAndUser(
    userId: string,
    exerciseId: string
  ): Promise<{ maxVolume: number; date: Date } | null> {
    const result = await prisma.exerciseLog.findFirst({
      where: { userId, exerciseId },
      orderBy: { volume: 'desc' },
      select: {
        volume: true,
        date: true,
      },
    })

    if (!result) {
      return null
    }
    return { maxVolume: result.volume, date: result.date }
  }
}
