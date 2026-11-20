import type { Prisma, PrismaClient, UserStreak } from 'generated/prisma'

import { prisma } from '@/lib/prisma'

import type { UserStreaksRepository } from '../user-streaks.repository'

export class PrismaUserStreaksRepository implements UserStreaksRepository {
  constructor(
    private readonly client: Prisma.TransactionClient | PrismaClient = prisma
  ) {}

  async findByUserId(userId: string): Promise<UserStreak | null> {
    return await this.client.userStreak.findUnique({
      where: { userId },
    })
  }

  async create(data: Prisma.UserStreakCreateInput): Promise<UserStreak> {
    return await this.client.userStreak.create({
      data,
    })
  }

  async update(
    id: string,
    data: Prisma.UserStreakUpdateInput
  ): Promise<UserStreak> {
    return await this.client.userStreak.update({
      where: { id },
      data,
    })
  }
}
