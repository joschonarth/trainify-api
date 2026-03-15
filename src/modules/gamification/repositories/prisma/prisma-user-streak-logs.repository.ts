import type { UserStreakLog } from 'generated/prisma'

import { prisma } from '@/lib/prisma'

import type { UserStreakLogsRepository } from '../user-streak-logs.repository'

export class PrismaUserStreakLogsRepository
  implements UserStreakLogsRepository
{
  async findByUserAndDate(
    userId: string,
    date: Date
  ): Promise<UserStreakLog | null> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return await prisma.userStreakLog.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })
  }

  async findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UserStreakLog[]> {
    return await prisma.userStreakLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })
  }

  async findAllByUser(userId: string): Promise<UserStreakLog[]> {
    return await prisma.userStreakLog.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    })
  }

  async create(data: { userId: string; date: Date }): Promise<UserStreakLog> {
    return await prisma.userStreakLog.create({
      data,
    })
  }
}
