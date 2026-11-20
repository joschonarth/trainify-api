import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import type { UserStreakLogsRepository } from './user-streak-logs.repository'
import type { UserStreaksRepository } from './user-streaks.repository'

export interface StreakRepositories {
  users: Pick<UsersRepository, 'findById'>
  streaks: UserStreaksRepository
  logs: UserStreakLogsRepository
}

export interface StreakUnitOfWork {
  execute<T>(
    userId: string,
    operation: (repositories: StreakRepositories) => Promise<T>
  ): Promise<T>
}
