import type { WorkoutSessionStatus } from 'generated/prisma'

import type { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

interface ExerciseDetail {
  name: string
  plannedSets: number | null
  plannedReps: number | null
  plannedWeight: number | null
  completed: boolean
  loggedSets?: number | null
  loggedReps?: number | null
  loggedWeight?: number | null
  description?: string | null
  startedAt?: Date | null
  endedAt?: Date | null
  duration?: number | null
}

interface WorkoutSessionDetail {
  id: string
  date: Date
  status: WorkoutSessionStatus
  workout: string
  startedAt?: Date | null
  endedAt?: Date | null
  duration?: number | null
  exercises: ExerciseDetail[]
}

interface GetWorkoutSessionDetailsResponse {
  session: WorkoutSessionDetail
}

export class GetWorkoutSessionDetailsUseCase {
  constructor(
    private readonly workoutSessionsRepository: WorkoutSessionsRepository
  ) {}

  async execute({
    sessionId,
  }: {
    sessionId: string
  }): Promise<GetWorkoutSessionDetailsResponse> {
    const session =
      await this.workoutSessionsRepository.findByIdWithWorkoutAndExerciseSessions(
        sessionId
      )

    if (!session) {
      throw new ResourceNotFoundError('Workout session not found.')
    }

    const sessionDetail: WorkoutSessionDetail = {
      id: session.id,
      date: session.date,
      status: session.status,
      workout: session.workout.name,
      startedAt: session.startedAt ?? null,
      endedAt: session.endedAt ?? null,
      duration: session.duration ?? null,
      exercises: session.workout.exercises.map((we) => {
        const exerciseSession = session.exerciseSessions.find(
          (es) => es.exercise.id === we.exercise.id
        )

        const lastLog = exerciseSession?.logs?.length
          ? exerciseSession.logs[exerciseSession.logs.length - 1]
          : null

        return {
          name: we.exercise.name,
          plannedSets: we.defaultSets,
          plannedReps: we.defaultReps,
          plannedWeight: we.defaultWeight,
          completed: exerciseSession?.completed ?? false,
          loggedSets: lastLog?.sets ?? null,
          loggedReps: lastLog?.reps ?? null,
          loggedWeight: lastLog?.weight ?? null,
          description: lastLog?.description ?? null,
          startedAt: exerciseSession?.startedAt ?? null,
          endedAt: exerciseSession?.endedAt ?? null,
          duration: exerciseSession?.duration ?? null,
        }
      }),
    }

    return { session: sessionDetail }
  }
}
