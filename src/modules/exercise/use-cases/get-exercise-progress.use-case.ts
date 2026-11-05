import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { ExerciseLogsRepository } from '../repositories/exercise-logs.repository'
import type { GetExerciseDetailsUseCase } from './get-exercise-details.use-case'

interface GetExerciseProgressRequest {
  userId: string
  exerciseId: string
}

export class GetExerciseProgressUseCase {
  constructor(
    private readonly exerciseLogsRepository: Pick<
      ExerciseLogsRepository,
      'findManyByExerciseAndUser' | 'findMaxVolumeByExerciseAndUser'
    >,
    private readonly getExerciseDetailsUseCase: Pick<
      GetExerciseDetailsUseCase,
      'execute'
    >
  ) {}

  async execute({ userId, exerciseId }: GetExerciseProgressRequest) {
    const { exercise } = await this.getExerciseDetailsUseCase.execute({
      userId,
      exerciseId,
    })

    if (!exercise) {
      throw new ResourceNotFoundError('Exercise not found.')
    }

    const logs = await this.exerciseLogsRepository.findManyByExerciseAndUser(
      userId,
      exerciseId
    )

    const orderedLogs = logs.sort((a, b) => a.date.getTime() - b.date.getTime())

    const progress = orderedLogs.map((log) => ({
      date: log.date.toISOString(),
      weight: log.weight ?? 0,
      reps: log.reps,
      sets: log.sets,
      volume: log.volume ?? log.sets * log.reps * (log.weight ?? 0),
    }))

    const totalVolume = progress.reduce((sum, log) => sum + log.volume, 0)
    const avgVolume = progress.length > 0 ? totalVolume / progress.length : 0

    const maxVolumeData =
      orderedLogs.length > 0
        ? await this.exerciseLogsRepository.findMaxVolumeByExerciseAndUser(
            userId,
            exerciseId
          )
        : null

    return {
      exerciseId,
      exerciseName: exercise.name,
      totalLogs: orderedLogs.length,
      totalVolume,
      avgVolume,
      maxVolume: maxVolumeData?.maxVolume ?? 0,
      maxVolumeDate: maxVolumeData?.date ?? null,
      progress,
    }
  }
}
