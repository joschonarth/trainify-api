import type { UserStreakLog } from 'generated/prisma'

import { prisma } from '@/lib/prisma'
import { getZonedDayRange } from '@/shared/utils/date-timezone'

import type { UserStreakLogsRepository } from '../user-streak-logs.repository'

export class PrismaUserStreakLogsRepository
  implements UserStreakLogsRepository
{
  async findByUserAndDate(
    userId: string,
    date: Date,
    timezone: string
  ): Promise<UserStreakLog | null> {
    const { start, end } = getZonedDayRange(date, timezone)

    return await prisma.userStreakLog.findFirst({
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
