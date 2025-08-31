import { ExerciseCategory, ExerciseLog } from '@prisma/client'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { ExerciseLogsRepository } from '@/repositories/exercise-logs.repository'

interface GetExerciseLogUseCaseRequest {
  logId: string
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
  constructor(private exerciseLogsRepository: ExerciseLogsRepository) {}

  async execute({
    logId,
  }: GetExerciseLogUseCaseRequest): Promise<GetExerciseLogUseCaseResponse> {
    const log = await this.exerciseLogsRepository.findById(logId)

    if (!log) {
      throw new ResourceNotFoundError('Exercise log not found.')
    }

    return { log }
  }
}
