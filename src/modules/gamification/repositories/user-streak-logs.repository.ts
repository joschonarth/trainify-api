import type { UserStreakLog } from '@prisma/client'

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
