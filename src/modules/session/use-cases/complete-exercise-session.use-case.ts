import type { ExerciseSessionsRepository } from '@/modules/session/repositories/exercise-sessions.repository'
import type { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

interface CompleteExerciseSessionUseCaseRequest {
  userId: string
  exerciseSessionId: string
}

export class CompleteExerciseSessionUseCase {
  constructor(
    private readonly exerciseSessionsRepository: ExerciseSessionsRepository,
    private readonly workoutSessionsRepository: WorkoutSessionsRepository
  ) {}

  async execute({
    userId,
    exerciseSessionId,
  }: CompleteExerciseSessionUseCaseRequest) {
    const exerciseSession =
      await this.exerciseSessionsRepository.findByIdWithLogs(exerciseSessionId)

    if (!exerciseSession) {
      throw new ResourceNotFoundError('Exercise session not found.')
    }

    const workoutSession = await this.workoutSessionsRepository.findById(
      exerciseSession.workoutSessionId
    )

    if (!workoutSession || workoutSession.userId !== userId) {
      throw new ResourceNotFoundError('Exercise session not found.')
    }

    const updated = await this.exerciseSessionsRepository.update(
      exerciseSessionId,
      {
        completed: true,
      }
    )

    return { exerciseSession: updated }
  }
}
