import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { ExerciseLogsRepository } from '../repositories/exercise-logs.repository'

interface GetExerciseProgressRequest {
  userId: string
  exerciseId: string
}

export class GetExerciseProgressUseCase {
  constructor(private exerciseLogsRepository: ExerciseLogsRepository) {}

  async execute({ userId, exerciseId }: GetExerciseProgressRequest) {
    const logs = await this.exerciseLogsRepository.findManyByExerciseAndUser(
      userId,
      exerciseId,
    )

    if (!logs || logs.length === 0) {
      throw new ResourceNotFoundError('No logs found for this exercise.')
    }

    const orderedLogs = logs.sort((a, b) => a.date.getTime() - b.date.getTime())

    const progress = orderedLogs.map((log) => ({
      date: log.date.toISOString().split('T')[0],
      weight: log.weight ?? 0,
      reps: log.reps,
      sets: log.sets,
    }))

    const firstLog = orderedLogs[0] ?? null

    return {
      exerciseId,
      exerciseName: firstLog?.exercise?.name ?? null,
      totalLogs: orderedLogs.length,
      progress,
    }
  }
}
