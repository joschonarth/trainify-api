import { WeightLog } from '@prisma/client'

import { WeightLogsRepository } from '../repositories/weight-logs.repository'

interface ListWeightLogsUseCaseRequest {
  userId: string
}

interface ListWeightLogsUseCaseResponse {
  weightLogs: WeightLog[]
}

export class ListWeightLogsUseCase {
  constructor(private weightLogsRepository: WeightLogsRepository) {}

  async execute({
    userId,
  }: ListWeightLogsUseCaseRequest): Promise<ListWeightLogsUseCaseResponse> {
    const weightLogs = await this.weightLogsRepository.findByUserId(userId)

    return { weightLogs }
  }
}
