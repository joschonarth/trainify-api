import type { ExerciseCategory, ExerciseLog } from 'generated/prisma'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { getLogVolume } from '@/shared/utils/calculate-volume'

import type { ExerciseLogsRepository } from '../repositories/exercise-logs.repository'

interface GetExerciseLogUseCaseRequest {
  logId: string
  userId: string
}

interface GetExerciseLogUseCaseResponse {
  log: ExerciseLog & {
    exercise: {
      id: string
      name: string
      category: ExerciseCategory | null
      type: string | null
    }
  }
}

export class GetExerciseLogUseCase {
  constructor(
    private readonly exerciseLogsRepository: ExerciseLogsRepository
  ) {}

  async execute({
    logId,
    userId,
  }: GetExerciseLogUseCaseRequest): Promise<GetExerciseLogUseCaseResponse> {
    const log = await this.exerciseLogsRepository.findById(logId)

    if (!log || log.userId !== userId) {
      throw new ResourceNotFoundError('Exercise log not found.')
    }

    return {
      log: { ...log, volume: getLogVolume(log, log.exercise.measurement) },
    }
  }
}
