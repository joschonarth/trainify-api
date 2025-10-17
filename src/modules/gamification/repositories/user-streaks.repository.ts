import { Prisma, UserStreak } from '@prisma/client'

export interface UserStreaksRepository {
  findByUserId(userId: string): Promise<UserStreak | null>
  create(data: Prisma.UserStreakCreateInput): Promise<UserStreak>
  update(id: string, data: Prisma.UserStreakUpdateInput): Promise<UserStreak>
}
