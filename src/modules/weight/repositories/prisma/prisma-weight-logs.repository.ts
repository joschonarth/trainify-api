import { Prisma, WeightLog } from '@prisma/client'

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

  async findManyByUserId(
    userId: string,
    filters?: { from?: Date; to?: Date },
  ): Promise<WeightLog[]> {
    const where: Prisma.WeightLogWhereInput = {
      userId,
      ...(filters?.from || filters?.to
        ? {
            createdAt: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    }

    return prisma.weightLog.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    })
  }

  async findByGoalId(goalId: string): Promise<WeightLog[]> {
    return prisma.weightLog.findMany({
      where: { goalId },
      orderBy: { createdAt: 'asc' },
    })
  }

  async findLatestByUserId(userId: string): Promise<WeightLog | null> {
    return prisma.weightLog.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findLatestByGoalId(goalId: string): Promise<WeightLog | null> {
    return prisma.weightLog.findFirst({
      where: { goalId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findFirstByUserId(userId: string): Promise<WeightLog | null> {
    return prisma.weightLog.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    })
  }

  async findMinByUserId(userId: string): Promise<WeightLog | null> {
    return prisma.weightLog.findFirst({
      where: { userId },
      orderBy: { weight: 'asc' },
    })
  }

  async findMaxByUserId(userId: string): Promise<WeightLog | null> {
    return prisma.weightLog.findFirst({
      where: { userId },
      orderBy: { weight: 'desc' },
    })
  }

  async findAverageByUserId(userId: string): Promise<number | null> {
    const result = await prisma.weightLog.aggregate({
      where: { userId },
      _avg: { weight: true },
    })
    return result._avg.weight ?? null
  }

  async delete(id: string): Promise<void> {
    await prisma.weightLog.delete({
      where: { id },
    })
  }
}
