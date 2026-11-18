import type { WorkoutSessionStatus } from 'generated/prisma'

import type { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'
import {
  getExerciseSessionState,
  getRepsComparison,
} from '@/modules/session/utils/exercise-session-state'

interface ExerciseHistory {
  name: string
  plannedSets: number | null
  plannedReps: number | null
  plannedWeight: number | null
  completed: boolean
  skipReason: string | null
  state: 'COMPLETED' | 'SKIPPED' | 'PENDING'
  loggedSets: number | null
  loggedReps: number | null
  loggedWeight: number | null
  description: string | null
  repsComparison: ReturnType<typeof getRepsComparison>
  duration: number | null
  startedAt: Date | null
  endedAt: Date | null
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
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface GetWorkoutSessionsHistoryRequest {
  userId: string
  page: number
  pageSize: number
  from?: Date
  to?: Date
  status?: WorkoutSessionStatus
  workoutId?: string
}

export class GetWorkoutSessionsHistoryUseCase {
  constructor(
    private readonly workoutSessionsRepository: Pick<
      WorkoutSessionsRepository,
      'findHistoryByUser'
    >
  ) {}

  async execute({
    userId,
    page,
    pageSize,
    from,
    to,
    status,
    workoutId,
  }: GetWorkoutSessionsHistoryRequest): Promise<GetWorkoutSessionsHistoryResponse> {
    const { sessions, total } =
      await this.workoutSessionsRepository.findHistoryByUser({
        userId,
        skip: (page - 1) * pageSize,
        take: pageSize,
        ...(from && { from }),
        ...(to && { to }),
        ...(status && { status }),
        ...(workoutId && { workoutId }),
      })

    const sessionsHistory: SessionHistory[] = sessions.map((session) => ({
      id: session.id,
      date: session.date,
      status: session.status,
      workout: session.workout.name,
      duration: session.duration ?? null,
      startedAt: session.startedAt ?? null,
      endedAt: session.endedAt ?? null,
      exercises: [...(session.exerciseSessions ?? [])]
        .sort((a, b) => {
          if (
            session.exerciseSessions.every(
              (exerciseSession) => exerciseSession.position === 0
            )
          ) {
            const aPosition = session.workout.exercises.find(
              (item) => item.exerciseId === a.exerciseId
            )?.position
            const bPosition = session.workout.exercises.find(
              (item) => item.exerciseId === b.exerciseId
            )?.position
            return (aPosition ?? 0) - (bPosition ?? 0)
          }

          return a.position - b.position
        })
        .map((ex) => {
          const lastLog = ex.logs[0] ?? null
          const plannedReps = ex.plannedReps
          const loggedReps = lastLog?.reps ?? null

          return {
            name: ex.exercise.name,
            plannedSets: ex.plannedSets,
            plannedReps,
            plannedWeight: ex.plannedWeight,
            completed: ex.completed,
            skipReason: ex.skipReason,
            state: getExerciseSessionState(
              ex.completed,
              session.endedAt,
              session.status
            ),
            loggedSets: lastLog?.sets ?? null,
            loggedReps,
            loggedWeight: lastLog?.weight ?? null,
            description: lastLog?.description ?? null,
            repsComparison: getRepsComparison(plannedReps, loggedReps),
            duration: ex.duration ?? null,
            startedAt: ex.startedAt ?? null,
            endedAt: ex.endedAt ?? null,
          }
        }),
    }))

    return {
      sessions: sessionsHistory,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    }
  }
}
