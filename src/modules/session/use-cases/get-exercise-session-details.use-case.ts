import type { ExerciseSessionsRepository } from '@/modules/session/repositories/exercise-sessions.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

interface ExerciseSessionDetails {
  id: string
  exerciseId: string
  exerciseName: string
  category: string | null
  type: string | null

  plannedSets: number | null
  plannedReps: number | null
  plannedWeight: number | null

  completed: boolean
  startedAt?: Date | null
  endedAt?: Date | null
  duration?: number | null

  loggedSets?: number | null
  loggedReps?: number | null
  loggedWeight?: number | null
  description?: string | null
}

interface GetExerciseSessionDetailsResponse {
  session: ExerciseSessionDetails
}

export class GetExerciseSessionDetailsUseCase {
  constructor(private exerciseSessionsRepository: ExerciseSessionsRepository) {}

  async execute({
    exerciseSessionId,
  }: {
    exerciseSessionId: string
  }): Promise<GetExerciseSessionDetailsResponse> {
    const exerciseSession =
      await this.exerciseSessionsRepository.findByIdWithLogs(exerciseSessionId)

    if (!exerciseSession) {
      throw new ResourceNotFoundError('Exercise session not found.')
    }

    const lastLog = exerciseSession.logs.length
      ? exerciseSession.logs[exerciseSession.logs.length - 1]
      : null

    const sessionDetail: ExerciseSessionDetails = {
      id: exerciseSession.id,
      exerciseId: exerciseSession.exercise.id,
      exerciseName: exerciseSession.exercise.name,
      category: exerciseSession.exercise.category,
      type: exerciseSession.exercise.type,

      plannedSets: exerciseSession.plannedSets,
      plannedReps: exerciseSession.plannedReps,
      plannedWeight: exerciseSession.plannedWeight,

      completed: exerciseSession.completed,
      startedAt: exerciseSession.startedAt ?? null,
      endedAt: exerciseSession.endedAt ?? null,
      duration: exerciseSession.duration ?? null,

      loggedSets: lastLog?.sets ?? null,
      loggedReps: lastLog?.reps ?? null,
      loggedWeight: lastLog?.weight ?? null,
      description: lastLog?.description ?? null,
    }

    return { session: sessionDetail }
  }
}
