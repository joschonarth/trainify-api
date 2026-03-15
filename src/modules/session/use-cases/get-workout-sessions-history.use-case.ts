import type { WorkoutSessionStatus } from 'generated/prisma'

import type {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '@/modules/session/repositories/workout-sessions.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

interface ExerciseHistory {
  name: string
  plannedSets: number | null
  plannedReps: number | null
  plannedWeight: number | null
  completed: boolean
  actualSets?: number | null
  actualReps?: number | null
  actualWeight?: number | null
  description?: string | null
  duration?: number | null
  startedAt?: Date | null
  endedAt?: Date | null
}

interface SessionHistory {
  id: string
  date: Date
  status: WorkoutSessionStatus
  workout: string
  duration?: number | null
  startedAt?: Date | null
  endedAt?: Date | null
  exercises: ExerciseHistory[]
}

interface GetWorkoutSessionsHistoryResponse {
  sessions: SessionHistory[]
}

export class GetWorkoutSessionsHistoryUseCase {
  constructor(
    private readonly workoutSessionsRepository: WorkoutSessionsRepository
  ) {}

  async execute({
    userId,
  }: {
    userId: string
  }): Promise<GetWorkoutSessionsHistoryResponse> {
    const sessions: WorkoutSessionWithWorkout[] =
      await this.workoutSessionsRepository.findAllByUser(userId)

    if (!sessions || sessions.length === 0) {
      throw new ResourceNotFoundError('No workout sessions found.')
    }

    const sessionsHistory: SessionHistory[] = sessions.map((session) => ({
      id: session.id,
      date: session.date,
      status: session.status,
      workout: session.workout.name,
      duration: session.duration ?? null,
      startedAt: session.startedAt ?? null,
      endedAt: session.endedAt ?? null,
      exercises: (session.exerciseSessions ?? []).map((ex) => {
        const lastLog = ex.logs.length > 0 ? ex.logs[ex.logs.length - 1] : null

        return {
          name: ex.exercise.name,
          plannedSets: ex.sets ?? null,
          plannedReps: ex.reps ?? null,
          plannedWeight: ex.weight ?? null,
          completed: ex.completed ?? false,
          loggedSets: lastLog?.sets ?? null,
          loggedReps: lastLog?.reps ?? null,
          loggedWeight: lastLog?.weight ?? null,
          description: lastLog?.description ?? null,
          duration: ex.duration ?? null,
          startedAt: ex.startedAt ?? null,
          endedAt: ex.endedAt ?? null,
        }
      }),
    }))

    return { sessions: sessionsHistory }
  }
}
