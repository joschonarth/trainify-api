import type { Prisma, UserStreak } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import type { UserStreaksRepository } from '../user-streaks.repository'

export class PrismaUserStreaksRepository implements UserStreaksRepository {
  async findByUserId(userId: string): Promise<UserStreak | null> {
    return prisma.userStreak.findUnique({
      where: { userId },
    })
  }

  async create(data: Prisma.UserStreakCreateInput): Promise<UserStreak> {
    return prisma.userStreak.create({
      data,
    })
  }

  async update(
    id: string,
    data: Prisma.UserStreakUpdateInput
  ): Promise<UserStreak> {
    return prisma.userStreak.update({
      where: { id },
      data,
    })
  }
}
