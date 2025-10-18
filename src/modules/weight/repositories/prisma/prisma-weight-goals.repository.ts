import { WeightGoal, WeightLog } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import {
  CreateWeightGoalData,
  WeightGoalsRepository,
} from '../weight-goals.repository'

export class PrismaWeightGoalsRepository implements WeightGoalsRepository {
  async findById(
    id: string,
  ): Promise<(WeightGoal & { logs: WeightLog[] }) | null> {
    return prisma.weightGoal.findUnique({
      where: { id },
      include: { logs: true },
    })
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

  async findActiveGoalByUserId(userId: string): Promise<WeightGoal | null> {
    return prisma.weightGoal.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: CreateWeightGoalData): Promise<WeightGoal> {
    return prisma.weightGoal.create({
      data: {
        user: { connect: { id: data.userId } },
        name: data.name,
        description: data.description ?? null,
        goalType: data.goalType,
        startWeight: data.startWeight ?? null,
        targetWeight: data.targetWeight,
        startDate: data.startDate ?? new Date(),
        endDate: data.endDate ?? null,
        progress: 0,
      },
    })
  }

  async deactivateGoal(id: string): Promise<void> {
    await prisma.weightGoal.update({
      where: { id },
      data: { isActive: false },
    })
  }

  async markAsAchieved(id: string, achievedAt: Date): Promise<void> {
    await prisma.weightGoal.update({
      where: { id },
      data: { achievedAt, isActive: false },
    })
  }

  async update(
    id: string,
    data: {
      name?: string
      description?: string | null
      endDate?: Date | null
      startWeight?: number | null
    },
  ): Promise<WeightGoal> {
    return prisma.weightGoal.update({
      where: { id },
      data: {
        ...data,
      },
    })
  }

  async updateProgress(id: string, progress: number): Promise<void> {
    await prisma.weightGoal.update({
      where: { id },
      data: { progress },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.weightGoal.delete({
      where: { id },
    })
  }
}
