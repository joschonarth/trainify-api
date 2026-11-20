import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'
import { InMemoryStreakPlansRepository } from '../repositories/in-memory/in-memory-streak-plans.repository'
import { InMemoryStreakUnitOfWork } from '../repositories/in-memory/in-memory-streak-unit-of-work'
import { InMemoryUserStreakLogsRepository } from '../repositories/in-memory/in-memory-user-streak-logs.repository'
import { InMemoryUserStreaksRepository } from '../repositories/in-memory/in-memory-user-streaks.repository'
import { GetUserStreakUseCase } from '../use-cases/get-user-streak.use-case'
import { RefreshUserStreakUseCase } from '../use-cases/refresh-user-streak.use-case'
import { UpdateUserStreakUseCase } from '../use-cases/update-user-streak.use-case'

export async function makePlannedStreakContext() {
  const users = new InMemoryUsersRepository()
  await makeUser(users, { id: 'user', timezone: 'America/Sao_Paulo' })
  const plans = new InMemoryStreakPlansRepository()
  plans.items.set('user', {
    timezone: 'America/Sao_Paulo',
    activationDate: '2026-11-16',
    versions: [
      {
        effectiveDate: '2026-11-16',
        workouts: { 1: 'a', 2: 'b', 4: 'a', 5: 'b' },
      },
    ],
  })
  const logs = new InMemoryUserStreakLogsRepository()
  const streaks = new InMemoryUserStreaksRepository()
  const unit = new InMemoryStreakUnitOfWork({ users, plans, logs, streaks })
  const update = new UpdateUserStreakUseCase(unit)
  const refresh = new RefreshUserStreakUseCase(unit)
  const read = new GetUserStreakUseCase(users, plans, logs)
  const credit = (businessDate: string) =>
    update.execute({
      userId: 'user',
      logDate: new Date(`${businessDate}T15:00:00Z`),
      creditDay: { businessDate, timezone: 'America/Sao_Paulo' },
    })
  const recordActivity = (businessDate: string) =>
    logs.create({
      userId: 'user',
      date: new Date(businessDate),
      businessDate,
    })
  return {
    users,
    plans,
    logs,
    streaks,
    unit,
    update,
    refresh,
    read,
    credit,
    recordActivity,
  }
}
