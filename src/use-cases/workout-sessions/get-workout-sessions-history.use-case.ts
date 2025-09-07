import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { WorkoutSessionsRepository } from '@/repositories/workout-sessions.repository'

interface ExerciseHistory {
  name: string
  plannedSets: number | null
  plannedReps: number | null
  weight: number | null
  loggedSets?: number | null
  loggedReps?: number | null
  description?: string | null
}

interface SessionHistory {
  id: string
  date: Date
  workout: string
  completed: boolean
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
    const sessions = await this.workoutSessionsRepository.findAllByUser(userId)

    if (!sessions || sessions.length === 0) {
      throw new ResourceNotFoundError('No workout sessions found.')
    }

    const sessionsHistory: SessionHistory[] = sessions.map((session) => ({
      id: session.id,
      date: session.date,
      completed: session.completed,
      workout: session.workout.name,
      exercises: session.workout.exercises.map((we) => {
        const log = session.logs.find((l) => l.exerciseId === we.exercise.id)

        return {
          name: we.exercise.name,
          plannedSets: we.defaultSets,
          plannedReps: we.defaultReps,
          weight: we.defaultWeight,
          loggedSets: log?.sets ?? null,
          loggedReps: log?.reps ?? null,
          description: log?.description ?? null,
        }
      }),
    }))

    return { sessions: sessionsHistory }
  }
}
