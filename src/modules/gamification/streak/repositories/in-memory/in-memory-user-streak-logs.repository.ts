import { randomUUID } from 'node:crypto'
import dayjs from 'dayjs'
import type { UserStreakLog } from 'generated/prisma'
import { getZonedDayRange } from '@/shared/utils/date-timezone'
import type { UserStreakLogsRepository } from '../user-streak-logs.repository'

export class InMemoryUserStreakLogsRepository
  implements UserStreakLogsRepository
{
  items: UserStreakLog[] = []
  findByUserAndDate(userId: string, date: Date, timezone: string) {
    const { start, end } = getZonedDayRange(date, timezone)
    const businessDate = dayjs(date).tz(timezone).format('YYYY-MM-DD')
    return Promise.resolve(
      this.items.find(
        (item) =>
          item.userId === userId &&
          (item.businessDate === businessDate ||
            (!item.businessDate && item.date >= start && item.date <= end))
      ) ?? null
    )
  }
  findByUserAndDateRange(userId: string, startDate: Date, endDate: Date) {
    return Promise.resolve(
      this.items
        .filter(
          (item) =>
            item.userId === userId &&
            item.date >= startDate &&
            item.date <= endDate
        )
        .sort((a, b) => a.date.getTime() - b.date.getTime())
    )
  }
  findByBusinessDateRange(userId: string, start: string, end: string) {
    return Promise.resolve(
      this.items.filter(
        (log) =>
          log.userId === userId &&
          log.businessDate !== null &&
          log.businessDate >= start &&
          log.businessDate <= end
      )
    )
  }
  assignBusinessDate(id: string, businessDate: string) {
    const log = this.items.find((item) => item.id === id)
    if (!log) {
      throw new Error('Activity not found')
    }
    log.businessDate = businessDate
    return Promise.resolve(log)
  }
  findAllByUser(userId: string) {
    return Promise.resolve(
      this.items
        .filter((item) => item.userId === userId)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
    )
  }
  create(data: { userId: string; date: Date; businessDate?: string }) {
    const item = {
      id: randomUUID(),
      businessDate: null,
      ...data,
      createdAt: new Date(),
    }
    this.items.push(item)
    return Promise.resolve(item)
  }
}
