import type { Prisma, WeightGoal } from 'generated/prisma'

import { prisma } from '@/lib/prisma'

import type {
  CreateWeightGoalData,
  WeightGoalsRepository,
} from '../weight-goals.repository'

export class PrismaWeightGoalsRepository implements WeightGoalsRepository {
  constructor(private readonly client: Prisma.TransactionClient = prisma) {}

  findById(id: string): Promise<WeightGoal | null> {
    return this.client.weightGoal.findUnique({
      where: { id },
    })
  }

  findAllByUserId(
    userId: string,
    filters?: { status?: 'active' | 'completed' }
  ): Promise<WeightGoal[]> {
    return this.client.weightGoal.findMany({
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

  findActiveGoalByUserId(userId: string): Promise<WeightGoal | null> {
    return this.client.weightGoal.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  create(data: CreateWeightGoalData): Promise<WeightGoal> {
    return this.client.weightGoal.create({
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
    await this.client.weightGoal.update({
      where: { id },
      data: { isActive: false },
    })
  }

  async deactivateAllByUserId(userId: string): Promise<void> {
    await this.client.weightGoal.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    })
  }

  async markAsAchieved(id: string, achievedAt: Date): Promise<void> {
    await this.client.weightGoal.update({
      where: { id },
      data: { achievedAt, isActive: false },
    })
  }

  update(
    id: string,
    data: {
      name?: string
      description?: string | null
      endDate?: Date | null
      startWeight?: number | null
    }
  ): Promise<WeightGoal> {
    return this.client.weightGoal.update({
      where: { id },
      data: {
        ...data,
      },
    })
  }

  async updateProgress(id: string, progress: number): Promise<void> {
    await this.client.weightGoal.update({
      where: { id },
      data: { progress },
    })
  }

  async delete(id: string): Promise<void> {
    await this.client.weightGoal.delete({
      where: { id },
    })
  }
}
