import { WeightLog } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import {
  CreateWeightLogData,
  WeightLogsRepository,
} from '../weight-logs.repository'

export class PrismaWeightLogsRepository implements WeightLogsRepository {
  async create(data: CreateWeightLogData): Promise<WeightLog> {
    const { userId, goalId, weight, note } = data

    const safeNote = note ?? null

    return prisma.weightLog.create({
      data: {
        weight,
        note: safeNote,
        createdAt: new Date(),
        user: { connect: { id: userId } },
        ...(goalId ? { goal: { connect: { id: goalId } } } : {}),
      },
    })
  }

  async findById(id: string): Promise<WeightLog | null> {
    return prisma.weightLog.findUnique({
      where: { id },
    })
  }

  async findByUserId(userId: string): Promise<WeightLog[]> {
    return prisma.weightLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findLatestByUserId(userId: string): Promise<WeightLog | null> {
    return prisma.weightLog.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.weightLog.delete({
      where: { id },
    })
  }
}
