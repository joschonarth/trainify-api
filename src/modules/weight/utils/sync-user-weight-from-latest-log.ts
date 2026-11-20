import type { UsersRepository } from '@/modules/user/repositories/users.repository'

import type { WeightLogsRepository } from '../repositories/weight-logs.repository'

export async function syncUserWeightFromLatestLog(
  userId: string,
  usersRepository: Pick<UsersRepository, 'update'>,
  weightLogsRepository: WeightLogsRepository
): Promise<void> {
  const latestLog = await weightLogsRepository.findLatestByUserId(userId)

  if (latestLog) {
    await usersRepository.update(userId, { weight: latestLog.weight })
  }
}
