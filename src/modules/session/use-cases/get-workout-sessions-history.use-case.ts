import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '@/modules/session/repositories/workout-sessions.repository'

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
}

interface SessionHistory {
  id: string
  date: Date
  workout: string
  exercises: ExerciseHistory[]
}

interface GetWorkoutSessionsHistoryResponse {
  sessions: SessionHistory[]
}

export class GetWorkoutSessionsHistoryUseCase {
  constructor(private workoutSessionsRepository: WorkoutSessionsRepository) {}

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
      workout: session.workout.name,
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
        }
      }),
    }))

    return { sessions: sessionsHistory }
  }
}
