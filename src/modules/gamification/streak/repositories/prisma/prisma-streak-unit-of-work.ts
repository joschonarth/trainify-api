import type { PrismaClient } from 'generated/prisma'
import { prisma } from '@/lib/prisma'
import type {
  StreakRepositories,
  StreakUnitOfWork,
} from '../streak-unit-of-work'
import { PrismaStreakPlansRepository } from './prisma-streak-plans.repository'
import { PrismaUserStreakLogsRepository } from './prisma-user-streak-logs.repository'
import { PrismaUserStreaksRepository } from './prisma-user-streaks.repository'

export class PrismaStreakUnitOfWork implements StreakUnitOfWork {
  constructor(private readonly client: PrismaClient = prisma) {}
  async execute<T>(
    userId: string,
    operation: (repositories: StreakRepositories) => Promise<T>
  ): Promise<T> {
    return await this.client.$transaction(async (transaction) => {
      // Lock the user even when a streak does not exist; refresh and activity share this lock.
      await transaction.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`
      const streaks = new PrismaUserStreaksRepository(transaction)
      const logs = new PrismaUserStreakLogsRepository(transaction)
      const plans = new PrismaStreakPlansRepository(transaction)
      const users = {
        findById: (id: string) =>
          transaction.user.findUnique({ where: { id } }),
      }
      return await operation({
        users,
        streaks,
        logs,
        plans,
      })
    })
  }
}
