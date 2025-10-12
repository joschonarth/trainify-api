import { WeightGoal } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import {
  CreateWeightGoalData,
  WeightGoalsRepository,
} from '../weight-goals.repository'

export class PrismaWeightGoalsRepository implements WeightGoalsRepository {
  async create(data: CreateWeightGoalData): Promise<WeightGoal> {
    return prisma.weightGoal.create({
      data: {
        user: { connect: { id: data.userId } },
        goalType: data.goalType,
        startWeight: data.startWeight,
        targetWeight: data.targetWeight,
        startDate: data.startDate ?? new Date(),
        endDate: data.endDate ?? null,
      },
    })
  }

  async findActiveGoalByUserId(userId: string): Promise<WeightGoal | null> {
    return prisma.weightGoal.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async deactivateGoal(id: string): Promise<void> {
    await prisma.weightGoal.update({
      where: { id },
      data: { isActive: false },
    })
  }

  async findById(id: string): Promise<WeightGoal | null> {
    return prisma.weightGoal.findUnique({ where: { id } })
  }

  async findAllByUserId(
    userId: string,
    filters?: { status?: 'active' | 'completed' },
  ): Promise<WeightGoal[]> {
    return prisma.weightGoal.findMany({
      where: {
        userId,
        ...(filters?.status === 'active' && {
          isActive: true,
        }),
        ...(filters?.status === 'completed' && {
          achievedAt: { not: null },
        }),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async markAsAchieved(id: string, achievedAt: Date): Promise<void> {
    await prisma.weightGoal.update({
      where: { id },
      data: { achievedAt, isActive: false },
    })
  }
}
