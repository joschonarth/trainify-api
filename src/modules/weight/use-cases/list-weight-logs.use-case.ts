import type { WeightLog } from 'generated/prisma'

import type { WeightLogsRepository } from '../repositories/weight-logs.repository'

interface ListWeightLogsUseCaseRequest {
  userId: string
}

interface ListWeightLogsUseCaseResponse {
  weightLogs: WeightLog[]
}

export class ListWeightLogsUseCase {
  constructor(private readonly weightLogsRepository: WeightLogsRepository) {}

  async execute({
    userId,
  }: ListWeightLogsUseCaseRequest): Promise<ListWeightLogsUseCaseResponse> {
    const weightLogs = await this.weightLogsRepository.findByUserId(userId)

    return { weightLogs }
  }
}
