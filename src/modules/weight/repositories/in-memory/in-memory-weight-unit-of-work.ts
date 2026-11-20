import type { User, WeightGoal, WeightLog } from 'generated/prisma'

import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'

import type {
  WeightRepositories,
  WeightUnitOfWork,
} from '../weight-unit-of-work'
import { InMemoryWeightGoalsRepository } from './in-memory-weight-goals.repository'
import { InMemoryWeightLogsRepository } from './in-memory-weight-logs.repository'

export class InMemoryWeightUnitOfWork implements WeightUnitOfWork {
  readonly goalRepository = new InMemoryWeightGoalsRepository()
  readonly logRepository = new InMemoryWeightLogsRepository()
  readonly userRepository = new InMemoryUsersRepository()
  readonly repositories: WeightRepositories = {
    goals: this.goalRepository,
    logs: this.logRepository,
    users: this.userRepository,
  }

  get goals(): WeightGoal[] {
    return this.goalRepository.items
  }

  get logs(): WeightLog[] {
    return this.logRepository.items
  }

  get users(): User[] {
    return this.userRepository.items
  }

  execute<T>(
    _userId: string,
    operation: (repositories: WeightRepositories) => Promise<T>
  ): Promise<T> {
    return operation(this.repositories)
  }
}
