import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { ExerciseTimerNotStartedError } from '../errors/exercise-timer-not-started.error'
import type { ExerciseTimerUnitOfWork } from '../repositories/exercise-timer-unit-of-work'
import { assertSessionBusinessDay } from '../utils/session-business-day'

interface StopExerciseTimerRequest {
  userId: string
  exerciseSessionId: string
}

export class StopExerciseTimerUseCase {
  constructor(private readonly unitOfWork: ExerciseTimerUnitOfWork) {}

  async execute({ userId, exerciseSessionId }: StopExerciseTimerRequest) {
    return await this.unitOfWork.execute(
      exerciseSessionId,
      async ({ exerciseSessions, workoutSessions }) => {
        const exerciseSession =
          await exerciseSessions.findById(exerciseSessionId)

        if (!exerciseSession) {
          throw new ResourceNotFoundError('Exercise session not found.')
        }

        const workoutSession = await workoutSessions.findById(
          exerciseSession.workoutSessionId
        )

        if (!workoutSession || workoutSession.userId !== userId) {
          throw new ResourceNotFoundError('Exercise session not found.')
        }

        if (workoutSession.status !== 'IN_PROGRESS' || workoutSession.endedAt) {
          throw new NotAllowedError('Session must be in progress.')
        }

        assertSessionBusinessDay(workoutSession)

        if (exerciseSession.completed) {
          throw new NotAllowedError('Exercise session is already completed.')
        }
        if (!exerciseSession.startedAt) {
          throw new ExerciseTimerNotStartedError()
        }

        if (exerciseSession.endedAt) {
          return {
            exerciseSession,
            elapsed:
              exerciseSession.duration ??
              Math.floor(
                (exerciseSession.endedAt.getTime() -
                  exerciseSession.startedAt.getTime()) /
                  1000
              ),
          }
        }

        const now = new Date()

        const elapsed = Math.floor(
          (now.getTime() - exerciseSession.startedAt.getTime()) / 1000
        )

        const updated = await exerciseSessions.update(exerciseSessionId, {
          endedAt: now,
          duration: elapsed,
        })

        return { exerciseSession: updated, elapsed }
      }
    )
  }
}
