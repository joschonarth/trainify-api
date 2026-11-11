import dayjs from 'dayjs'
import type { ExerciseSessionsRepository } from '@/modules/session/repositories/exercise-sessions.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { GetExerciseDetailsUseCase } from './get-exercise-details.use-case'

type Period = 'WEEK' | 'MONTH' | 'ALL'

interface GetExerciseProgressRequest {
  userId: string
  exerciseId: string
  period?: Period
}

export class GetExerciseProgressUseCase {
  constructor(
    private readonly exerciseSessionsRepository: Pick<
      ExerciseSessionsRepository,
      'findManyByUserAndExercise'
    >,
    private readonly getExerciseDetailsUseCase: Pick<
      GetExerciseDetailsUseCase,
      'execute'
    >
  ) {}

  async execute({
    userId,
    exerciseId,
    period = 'ALL',
  }: GetExerciseProgressRequest) {
    const { exercise } = await this.getExerciseDetailsUseCase.execute({
      userId,
      exerciseId,
    })

    if (!exercise) {
      throw new ResourceNotFoundError('Exercise not found.')
    }

    let fromDate: Date | undefined
    if (period === 'WEEK') {
      fromDate = dayjs().subtract(7, 'day').toDate()
    } else if (period === 'MONTH') {
      fromDate = dayjs().subtract(30, 'day').toDate()
    }

    const sessions =
      await this.exerciseSessionsRepository.findManyByUserAndExercise(
        userId,
        exerciseId,
        fromDate
      )

    const progress = sessions
      .map((session) => {
        const totalVolume = session.logs.reduce(
          (sum, log) => sum + log.volume,
          0
        )
        const totalSets = session.logs.reduce((sum, log) => sum + log.sets, 0)
        const totalReps = session.logs.reduce((sum, log) => sum + log.reps, 0)
        const totalWeight = session.logs.reduce(
          (sum, log) => sum + (log.weight ?? 0),
          0
        )

        return {
          sessionId: session.id,
          date: session.startedAt ?? session.endedAt ?? null,
          duration: session.duration ?? 0,
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          totalVolume,
          totalSets,
          totalReps,
          totalWeight,
          logs: session.logs.map((log) => ({
            id: log.id,
            sets: log.sets,
            reps: log.reps,
            weight: log.weight,
            volume: log.volume,
            date: log.date,
            description: log.description,
          })),
        }
      })
      .sort((a, b) => {
        const aDate = a.date ?? a.endedAt
        const bDate = b.date ?? b.endedAt
        return (aDate?.getTime() ?? 0) - (bDate?.getTime() ?? 0)
      })

    const totalVolume = progress.reduce(
      (sum, session) => sum + session.totalVolume,
      0
    )
    const totalSets = progress.reduce(
      (sum, session) => sum + session.totalSets,
      0
    )
    const totalReps = progress.reduce(
      (sum, session) => sum + session.totalReps,
      0
    )
    const totalWeight = progress.reduce(
      (sum, session) => sum + session.totalWeight,
      0
    )
    const totalDuration = progress.reduce(
      (sum, session) => sum + session.duration,
      0
    )
    const maxVolumeSession = progress.reduce<(typeof progress)[number] | null>(
      (max, session) =>
        !max || session.totalVolume > max.totalVolume ? session : max,
      null
    )
    const avg = (total: number) =>
      progress.length > 0 ? total / progress.length : 0

    return {
      exerciseId,
      exerciseName: exercise.name,
      totalLogs: progress.reduce(
        (sum, session) => sum + session.logs.length,
        0
      ),
      totalSessions: progress.length,
      totalVolume,
      avgVolume: avg(totalVolume),
      maxVolume: maxVolumeSession?.totalVolume ?? 0,
      maxVolumeDate: maxVolumeSession?.date ?? null,
      totalSets,
      avgSets: avg(totalSets),
      maxSets: progress.reduce(
        (max, session) => Math.max(max, session.totalSets),
        0
      ),
      totalReps,
      avgReps: avg(totalReps),
      maxReps: progress.reduce(
        (max, session) => Math.max(max, session.totalReps),
        0
      ),
      totalWeight,
      avgWeight: avg(totalWeight),
      maxWeight: progress.reduce(
        (max, session) => Math.max(max, session.totalWeight),
        0
      ),
      totalDuration,
      avgDuration: avg(totalDuration),
      progress,
    }
  }
}
