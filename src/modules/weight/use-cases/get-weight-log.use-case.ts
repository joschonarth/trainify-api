import { ResourceNotFoundError } from '@/errors/resource-not-found.error'

import { WeightLogsRepository } from '../repositories/weight-logs.repository'

interface GetWeightLogRequest {
  logId: string
  userId: string
}

interface GetWeightLogResponse {
  id: string
  userId: string
  goalId: string | null
  weight: number
  note: string | null
  date: Date
  createdAt: Date
}

export class GetWeightLogUseCase {
  constructor(private weightLogsRepository: WeightLogsRepository) {}

  async execute({
    logId,
    userId,
  }: GetWeightLogRequest): Promise<GetWeightLogResponse> {
    const log = await this.weightLogsRepository.findById(logId)

    if (!log || log.userId !== userId) {
      throw new ResourceNotFoundError('Weight log not found')
    }

    return {
      id: log.id,
      userId: log.userId,
      goalId: log.goalId,
      weight: log.weight,
      note: log.note,
      date: log.date,
      createdAt: log.createdAt,
    }
  }
}
