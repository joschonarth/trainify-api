import type {
  StreakRepositories,
  StreakUnitOfWork,
} from '../streak-unit-of-work'
import type { InMemoryUserStreakLogsRepository } from './in-memory-user-streak-logs.repository'
import type { InMemoryUserStreaksRepository } from './in-memory-user-streaks.repository'

type InMemoryStreakRepositories = StreakRepositories & {
  streaks: InMemoryUserStreaksRepository
  logs: InMemoryUserStreakLogsRepository
}

export class InMemoryStreakUnitOfWork implements StreakUnitOfWork {
  private queue: Promise<unknown> = Promise.resolve()
  constructor(private readonly repositories: InMemoryStreakRepositories) {}
  execute<T>(
    _userId: string,
    operation: (repositories: StreakRepositories) => Promise<T>
  ): Promise<T> {
    const result = this.queue.then(async () => {
      const streaks = structuredClone(this.repositories.streaks.items)
      const logs = structuredClone(this.repositories.logs.items)
      try {
        return await operation(this.repositories)
      } catch (error) {
        this.repositories.streaks.items = streaks
        this.repositories.logs.items = logs
        throw error
      }
    })
    this.queue = result.catch(() => undefined)
    return result
  }
}
