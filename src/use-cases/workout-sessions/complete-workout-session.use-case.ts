import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { WorkoutSessionsRepository } from '@/repositories/workout-sessions.repository'

interface CompleteWorkoutSessionRequest {
  userId: string
  sessionId: string
}

interface CompleteWorkoutSessionResponse {
  session: {
    id: string
    completed: boolean
    date: Date
    workoutId: string
  }
}

export class CompleteWorkoutSessionUseCase {
  constructor(private workoutSessionsRepository: WorkoutSessionsRepository) {}

  async execute({
    userId,
    sessionId,
  }: CompleteWorkoutSessionRequest): Promise<CompleteWorkoutSessionResponse> {
    const session = await this.workoutSessionsRepository.findById(sessionId)

    if (!session || session.userId !== userId) {
      throw new ResourceNotFoundError('Workout session not found.')
    }

    const updatedSession = await this.workoutSessionsRepository.updateCompleted(
      sessionId,
      true,
    )

    return { session: updatedSession }
  }
}
