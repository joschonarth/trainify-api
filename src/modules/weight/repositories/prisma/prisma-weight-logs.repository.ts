import type { Prisma, WeightLog } from 'generated/prisma'

import { prisma } from '@/lib/prisma'

import type {
  CreateWeightLogData,
  WeightLogsRepository,
} from '../weight-logs.repository'

export class PrismaWeightLogsRepository implements WeightLogsRepository {
  constructor(private readonly client: Prisma.TransactionClient = prisma) {}

  async create(data: CreateWeightLogData): Promise<WeightLog> {
    const { userId, goalId, weight, note, date } = data

    const safeNote = note ?? null

    return await this.client.weightLog.create({
      data: {
        weight,
        note: safeNote,
        ...(date ? { date } : {}),
        user: { connect: { id: userId } },
        ...(goalId ? { goal: { connect: { id: goalId } } } : {}),
      },
    })
  }

  async findById(id: string): Promise<WeightLog | null> {
    return await this.client.weightLog.findUnique({
      where: { id },
    })
  }

  async findByUserId(userId: string): Promise<WeightLog[]> {
    return await this.client.weightLog.findMany({
      where: { userId },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    })
  }

  async findManyByUserId(
    userId: string,
    filters?: { from?: Date; to?: Date }
  ): Promise<WeightLog[]> {
    const where: Prisma.WeightLogWhereInput = {
      userId,
      ...(filters?.from || filters?.to
        ? {
            date: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    }

    return await this.client.weightLog.findMany({
      where,
      orderBy: [{ date: 'asc' }, { id: 'asc' }],
    })
  }

  async findByGoalId(goalId: string): Promise<WeightLog[]> {
    return await this.client.weightLog.findMany({
      where: { goalId },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    })
  }

  async findLatestByUserId(
    userId: string,
    through?: Date
  ): Promise<WeightLog | null> {
    return await this.client.weightLog.findFirst({
      where: { userId, ...(through ? { date: { lte: through } } : {}) },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    })
  }

  async findLatestByGoalId(goalId: string): Promise<WeightLog | null> {
    return await this.client.weightLog.findFirst({
      where: { goalId },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    })
  }

  async findFirstByUserId(userId: string): Promise<WeightLog | null> {
    return await this.client.weightLog.findFirst({
      where: { userId },
      orderBy: [{ date: 'asc' }, { id: 'asc' }],
    })
  }

  async findFirstByGoalId(goalId: string): Promise<WeightLog | null> {
    return await this.client.weightLog.findFirst({
      where: { goalId },
      orderBy: [{ date: 'asc' }, { id: 'asc' }],
    })
  }

  async findMinByUserId(userId: string): Promise<WeightLog | null> {
    return await this.client.weightLog.findFirst({
      where: { userId },
      orderBy: { weight: 'asc' },
    })
  }

  async findMaxByUserId(userId: string): Promise<WeightLog | null> {
    return await this.client.weightLog.findFirst({
      where: { userId },
      orderBy: { weight: 'desc' },
    })
  }

  async findAverageByUserId(userId: string): Promise<number | null> {
    const result = await this.client.weightLog.aggregate({
      where: { userId },
      _avg: { weight: true },
    })
    return result._avg.weight ?? null
  }

  async update(
    id: string,
    data: {
      goalId?: string | null
      weight?: number
      note?: string | null
      date?: Date
    }
  ): Promise<WeightLog> {
    return await this.client.weightLog.update({
      where: { id },
      data: {
        ...(data.goalId === undefined ? {} : { goalId: data.goalId }),
        ...(data.weight === undefined ? {} : { weight: data.weight }),
        ...(data.note === undefined ? {} : { note: data.note }),
        ...(data.date === undefined ? {} : { date: data.date }),
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.client.weightLog.delete({
      where: { id },
    })
  }
}
