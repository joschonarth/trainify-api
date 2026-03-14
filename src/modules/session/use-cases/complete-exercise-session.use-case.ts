import type { ExerciseSessionsRepository } from '@/modules/session/repositories/exercise-sessions.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

interface CompleteExerciseSessionUseCaseRequest {
  exerciseSessionId: string
}

export class CompleteExerciseSessionUseCase {
  constructor(private exerciseSessionsRepository: ExerciseSessionsRepository) {}

  async execute({ exerciseSessionId }: CompleteExerciseSessionUseCaseRequest) {
    const exerciseSession =
      await this.exerciseSessionsRepository.findById(exerciseSessionId)

    if (!exerciseSession) {
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
