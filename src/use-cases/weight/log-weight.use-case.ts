import { WeightLog } from '@prisma/client'

import { WeightLogsRepository } from '@/repositories/weight-logs.repository'

interface LogWeightUseCaseRequest {
  userId: string
  weight: number
  note?: string | null
  goalId?: string | null
}

interface LogWeightUseCaseResponse {
  weightLog: WeightLog
}

export class LogWeightUseCase {
  constructor(private weightLogsRepository: WeightLogsRepository) {}

  async execute({
    userId,
    weight,
    note,
    goalId,
  }: LogWeightUseCaseRequest): Promise<LogWeightUseCaseResponse> {
    const weightLog = await this.weightLogsRepository.create({
      userId,
      goalId: goalId ?? null,
      weight,
      note: note ?? null,
    })

    return { weightLog }
  }
}
