import { UserStreakLog } from '@prisma/client'

export interface UserStreakLogsRepository {
  /**
   * Finds a streak log for a specific user and date (same day).
   */
  findByUserAndDate(userId: string, date: Date): Promise<UserStreakLog | null>

  /**
   * Creates a new streak log entry for the given user and date.
   */
  create(data: { userId: string; date: Date }): Promise<UserStreakLog>
}
