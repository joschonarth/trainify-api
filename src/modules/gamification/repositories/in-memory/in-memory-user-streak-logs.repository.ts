import { randomUUID } from 'node:crypto'
import type { UserStreakLog } from 'generated/prisma'
import { getZonedDayRange } from '@/shared/utils/date-timezone'
import type { UserStreakLogsRepository } from '../user-streak-logs.repository'

export class InMemoryUserStreakLogsRepository
  implements UserStreakLogsRepository
{
  items: UserStreakLog[] = []
  findByUserAndDate(userId: string, date: Date, timezone: string) {
    const { start, end } = getZonedDayRange(date, timezone)
    return Promise.resolve(
      this.items.find(
        (item) =>
          item.userId === userId && item.date >= start && item.date <= end
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
  findAllByUser(userId: string) {
    return Promise.resolve(
      this.items
        .filter((item) => item.userId === userId)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
    )
  }
  create(data: { userId: string; date: Date }) {
    const item = { id: randomUUID(), ...data, createdAt: new Date() }
    this.items.push(item)
    return Promise.resolve(item)
  }
}
