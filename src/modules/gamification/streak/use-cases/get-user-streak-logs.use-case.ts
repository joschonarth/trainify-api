import type { UserStreakLog } from 'generated/prisma'

import type { UserStreakLogsRepository } from '../repositories/user-streak-logs.repository'

interface GetUserStreakLogsRequest {
  userId: string
  startDate?: Date
  endDate?: Date
}

interface GetUserStreakLogsResponse {
  logs: UserStreakLog[]
}

export class GetUserStreakLogsUseCase {
  constructor(
    private readonly userStreakLogsRepository: UserStreakLogsRepository
  ) {}

  async execute({
    userId,
    startDate,
    endDate,
  }: GetUserStreakLogsRequest): Promise<GetUserStreakLogsResponse> {
    const logs =
      startDate && endDate
        ? await this.userStreakLogsRepository.findByUserAndDateRange(
            userId,
            startDate,
            endDate
          )
        : await this.userStreakLogsRepository.findAllByUser(userId)

    return { logs }
  }
}
