import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { StreakPlansRepository } from '../repositories/streak-plans.repository'
import type { UserStreakLogsRepository } from '../repositories/user-streak-logs.repository'
import { activityBusinessDate } from '../utils/activity-business-day'
import { evaluateTracking } from '../utils/evaluate-tracking'

export class GetUserStreakUseCase {
  constructor(
    private readonly users: Pick<UsersRepository, 'findById'>,
    private readonly plans: StreakPlansRepository,
    private readonly logs: UserStreakLogsRepository
  ) {}
  async execute(userId: string) {
    const user = await this.users.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError('User not found.')
    }
    const plan = await this.plans.findByUser(userId)
    const logs = await this.logs.findAllByUser(userId)
    return evaluateTracking(
      plan,
      logs.map((log) =>
        activityBusinessDate(log, plan?.timezone ?? user.timezone)
      )
    )
  }
}
