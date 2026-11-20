import type { UserStreakLog } from 'generated/prisma'

export interface UserStreakLogsRepository {
  findByUserAndDate(
    userId: string,
    date: Date,
    timezone: string
  ): Promise<UserStreakLog | null>
  findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UserStreakLog[]>
  findByBusinessDateRange(
    userId: string,
    start: string,
    end: string
  ): Promise<UserStreakLog[]>
  assignBusinessDate(id: string, businessDate: string): Promise<UserStreakLog>
  findAllByUser(userId: string): Promise<UserStreakLog[]>
  create(data: {
    userId: string
    date: Date
    businessDate?: string
  }): Promise<UserStreakLog>
}
