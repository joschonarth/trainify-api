import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { ExerciseLogsRepository } from '../repositories/exercise-logs.repository'

interface GetExerciseProgressRequest {
  userId: string
  exerciseId: string
}

export class GetExerciseProgressUseCase {
  constructor(
    private readonly exerciseLogsRepository: ExerciseLogsRepository
  ) {}

  async execute({ userId, exerciseId }: GetExerciseProgressRequest) {
    const logs = await this.exerciseLogsRepository.findManyByExerciseAndUser(
      userId,
      exerciseId
    )

    if (!logs || logs.length === 0) {
      throw new ResourceNotFoundError('No logs found for this exercise.')
    }

    const orderedLogs = logs.sort((a, b) => a.date.getTime() - b.date.getTime())

    const progress = orderedLogs.map((log) => ({
      date: log.date.toISOString(),
      weight: log.weight ?? 0,
      reps: log.reps,
      sets: log.sets,
      volume: log.volume ?? log.sets * log.reps * (log.weight ?? 0),
    }))

    const totalVolume = progress.reduce((sum, log) => sum + log.volume, 0)
    const avgVolume = totalVolume / progress.length

    const firstLog = orderedLogs[0] ?? null

    const maxVolumeData =
      await this.exerciseLogsRepository.findMaxVolumeByExerciseAndUser(
        userId,
        exerciseId
      )

    return {
      exerciseId,
      exerciseName: firstLog?.exercise?.name ?? null,
      totalLogs: orderedLogs.length,
      totalVolume,
      avgVolume,
      maxVolume: maxVolumeData?.maxVolume ?? 0,
      maxVolumeDate: maxVolumeData?.date ?? null,
      progress,
    }
  }
}
