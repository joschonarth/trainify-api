import type { UsersRepository } from '@/modules/user/repositories/users.repository'

import type { WeightGoalsRepository } from './weight-goals.repository'
import type { WeightLogsRepository } from './weight-logs.repository'

export interface WeightRepositories {
  goals: WeightGoalsRepository
  logs: WeightLogsRepository
  users: Pick<UsersRepository, 'findById' | 'update'>
}

export interface WeightUnitOfWork {
  execute<T>(
    userId: string,
    operation: (repositories: WeightRepositories) => Promise<T>
  ): Promise<T>
}
