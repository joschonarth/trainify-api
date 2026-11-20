import { prisma } from '@/lib/prisma'

import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'
import type {
  WeightRepositories,
  WeightUnitOfWork,
} from '../weight-unit-of-work'
import { PrismaWeightGoalsRepository } from './prisma-weight-goals.repository'
import { PrismaWeightLogsRepository } from './prisma-weight-logs.repository'

export class PrismaWeightUnitOfWork implements WeightUnitOfWork {
  async execute<T>(
    userId: string,
    operation: (repositories: WeightRepositories) => Promise<T>
  ): Promise<T> {
    return await prisma.$transaction(async (transaction) => {
      // Serialize weight mutations by user, including active-goal replacement.
      await transaction.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`

      return await operation({
        goals: new PrismaWeightGoalsRepository(transaction),
        logs: new PrismaWeightLogsRepository(transaction),
        users: new PrismaUsersRepository(transaction),
      })
    })
  }
}
