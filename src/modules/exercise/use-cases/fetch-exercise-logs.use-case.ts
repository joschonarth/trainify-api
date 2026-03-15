import type { ExerciseCategory, ExerciseType } from 'generated/prisma'

import type { ExerciseLogsRepository } from '../repositories/exercise-logs.repository'

interface FetchExerciseLogsUseCaseResponse {
  logs: {
    logId: string
    exerciseId: string
    name: string
    category: ExerciseCategory | null
    type: ExerciseType | null
    sets: number
    reps: number
    weight: number | null
    description: string | null
    date: Date
  }[]
}

export class FetchExerciseLogsUseCase {
  constructor(
    private readonly exerciseLogsRepository: ExerciseLogsRepository
  ) {}

  async execute(userId: string): Promise<FetchExerciseLogsUseCaseResponse> {
    const logs = await this.exerciseLogsRepository.findAllByUser(userId)

    const formattedLogs = logs.map((log) => ({
      logId: log.id,
      exerciseId: log.exercise.id,
      name: log.exercise.name,
      category: log.exercise.category,
      type: log.exercise.type,
      sets: log.sets,
      reps: log.reps,
      weight: log.weight,
      description: log.description,
      date: log.date,
    }))

    return { logs: formattedLogs }
  }
}
