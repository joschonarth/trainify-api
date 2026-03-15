import type { UserStreakLog } from 'generated/prisma'

export interface UserStreakLogsRepository {
  findByUserAndDate(userId: string, date: Date): Promise<UserStreakLog | null>
  findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UserStreakLog[]>
  findAllByUser(userId: string): Promise<UserStreakLog[]>
  create(data: { userId: string; date: Date }): Promise<UserStreakLog>
}
