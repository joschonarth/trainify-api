import type { WeightLog } from 'generated/prisma'

import type { WeightLogsRepository } from '../repositories/weight-logs.repository'

interface ListWeightLogsUseCaseRequest {
  userId: string
  page?: number
  pageSize?: number
}

interface ListWeightLogsUseCaseResponse {
  weightLogs: WeightLog[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export class ListWeightLogsUseCase {
  constructor(private readonly weightLogsRepository: WeightLogsRepository) {}

  async execute({
    userId,
    page = 1,
    pageSize = 20,
  }: ListWeightLogsUseCaseRequest): Promise<ListWeightLogsUseCaseResponse> {
    const result = await this.weightLogsRepository.findPageByUserId({
      userId,
      page,
      pageSize,
    })

    return {
      weightLogs: result.weightLogs,
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pageSize),
      },
    }
  }
}
