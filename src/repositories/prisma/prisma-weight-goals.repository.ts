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

  async findAllByUserId(userId: string): Promise<WeightGoal[]> {
    return prisma.weightGoal.findMany({ where: { userId } })
  }
}
