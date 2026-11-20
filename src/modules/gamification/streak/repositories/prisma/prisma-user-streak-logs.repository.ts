import type { Prisma, PrismaClient, UserStreakLog } from 'generated/prisma'

import { prisma } from '@/lib/prisma'
import { getZonedDayRange } from '@/shared/utils/date-timezone'

import type { UserStreakLogsRepository } from '../user-streak-logs.repository'

export class PrismaUserStreakLogsRepository
  implements UserStreakLogsRepository
{
  constructor(
    private readonly client: Prisma.TransactionClient | PrismaClient = prisma
  ) {}

  async findByUserAndDate(
    userId: string,
    date: Date,
    timezone: string
  ): Promise<UserStreakLog | null> {
    const { start, end } = getZonedDayRange(date, timezone)

    return await this.client.userStreakLog.findFirst({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
    })
  }

  async findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UserStreakLog[]> {
    return await this.client.userStreakLog.findMany({
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
    return await this.client.userStreakLog.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    })
  }

  async create(data: { userId: string; date: Date }): Promise<UserStreakLog> {
    return await this.client.userStreakLog.create({
      data,
    })
  }
}
