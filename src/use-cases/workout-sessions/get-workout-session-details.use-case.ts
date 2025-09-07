import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { WorkoutSessionsRepository } from '@/repositories/workout-sessions.repository'

interface ExerciseDetail {
  name: string
  plannedSets: number | null
  plannedReps: number | null
  plannedWeight: number | null
  loggedSets?: number | null
  loggedReps?: number | null
  loggedWeight?: number | null
  description?: string | null
}

interface WorkoutSessionDetail {
  id: string
  date: Date
  completed: boolean
  workout: string
  exercises: ExerciseDetail[]
}

interface GetWorkoutSessionDetailsResponse {
  session: WorkoutSessionDetail
}

export class GetWorkoutSessionDetailsUseCase {
  constructor(private workoutSessionsRepository: WorkoutSessionsRepository) {}

  async execute({
    sessionId,
  }: {
    sessionId: string
  }): Promise<GetWorkoutSessionDetailsResponse> {
    const session =
      await this.workoutSessionsRepository.findByIdWithWorkoutAndLogs(sessionId)

    if (!session) {
      throw new ResourceNotFoundError('Workout session not found.')
    }

    const sessionDetail: WorkoutSessionDetail = {
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
          plannedWeight: we.defaultWeight,
          loggedSets: log?.sets ?? null,
          loggedReps: log?.reps ?? null,
          loggedWeight: log?.weight ?? null,
          description: log?.description ?? null,
        }
      }),
    }

    return { session: sessionDetail }
  }
}
