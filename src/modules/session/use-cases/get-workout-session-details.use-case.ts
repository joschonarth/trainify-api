import type { WorkoutSessionStatus } from 'generated/prisma'

import type { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'
import { getRepsComparison } from '@/modules/session/utils/exercise-session-state'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

interface ExerciseDetails {
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
  startedAt: Date | null
  endedAt: Date | null
  duration: number | null
}

interface WorkoutSessionDetails {
  id: string
  date: Date
  status: WorkoutSessionStatus
  workout: string
  startedAt?: Date | null
  endedAt?: Date | null
  duration?: number | null
  exercises: ExerciseDetails[]
}

interface GetWorkoutSessionDetailsResponse {
  session: WorkoutSessionDetails
}

export class GetWorkoutSessionDetailsUseCase {
  constructor(
    private readonly workoutSessionsRepository: Pick<
      WorkoutSessionsRepository,
      'findByIdWithWorkoutAndExerciseSessions'
    >
  ) {}

  async execute({
    userId,
    sessionId,
  }: {
    userId: string
    sessionId: string
  }): Promise<GetWorkoutSessionDetailsResponse> {
    const session =
      await this.workoutSessionsRepository.findByIdWithWorkoutAndExerciseSessions(
        sessionId
      )

    if (!session || session.userId !== userId) {
      throw new ResourceNotFoundError('Workout session not found.')
    }

    const sessionDetail: WorkoutSessionDetails = {
      id: session.id,
      date: session.date,
      status: session.status,
      workout: session.workout.name,
      startedAt: session.startedAt ?? null,
      endedAt: session.endedAt ?? null,
      duration: session.duration ?? null,
      exercises: session.exerciseSessions.map((exerciseSession) => {
        const lastLog = exerciseSession.logs.at(-1) ?? null
        const plannedReps = exerciseSession.plannedReps
        const loggedReps = lastLog?.reps ?? null

        return {
          name: exerciseSession.exercise.name,
          plannedSets: exerciseSession.plannedSets,
          plannedReps,
          plannedWeight: exerciseSession.plannedWeight,
          completed: exerciseSession.completed,
          skipReason: exerciseSession.skipReason,
          state: exerciseSession.state,
          loggedSets: lastLog?.sets ?? null,
          loggedReps,
          loggedWeight: lastLog?.weight ?? null,
          description: lastLog?.description ?? null,
          repsComparison: getRepsComparison(plannedReps, loggedReps),
          startedAt: exerciseSession.startedAt,
          endedAt: exerciseSession.endedAt,
          duration: exerciseSession.duration,
        }
      }),
    }

    return { session: sessionDetail }
  }
}
