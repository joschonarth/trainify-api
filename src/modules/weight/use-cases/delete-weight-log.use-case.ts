import { ResourceNotFoundError } from '@/errors/resource-not-found.error'

import { WeightLogsRepository } from '../repositories/weight-logs.repository'

interface DeleteWeightLogRequest {
  logId: string
  userId: string
}

export class DeleteWeightLogUseCase {
  constructor(private weightLogsRepository: WeightLogsRepository) {}

  async execute({ logId, userId }: DeleteWeightLogRequest): Promise<void> {
    const log = await this.weightLogsRepository.findById(logId)

    if (!log || log.userId !== userId) {
      throw new ResourceNotFoundError('Weight log not found')
    }

    await this.weightLogsRepository.delete(logId)
  }
}
