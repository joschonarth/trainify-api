import dayjs from 'dayjs'
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
    const businessDate = dayjs(date).tz(timezone).format('YYYY-MM-DD')

    return await this.client.userStreakLog.findFirst({
      where: {
        userId,
        OR: [
          { businessDate },
          { businessDate: null, date: { gte: start, lte: end } },
        ],
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

  async findByBusinessDateRange(userId: string, start: string, end: string) {
    return await this.client.userStreakLog.findMany({
      where: { userId, businessDate: { gte: start, lte: end } },
    })
  }
  async assignBusinessDate(id: string, businessDate: string) {
    return await this.client.userStreakLog.update({
      where: { id },
      data: { businessDate },
    })
  }

  async findAllByUser(userId: string): Promise<UserStreakLog[]> {
    return await this.client.userStreakLog.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    })
  }

  async create(data: {
    userId: string
    date: Date
    businessDate?: string
  }): Promise<UserStreakLog> {
    return await this.client.userStreakLog.create({
      data,
    })
  }
}
