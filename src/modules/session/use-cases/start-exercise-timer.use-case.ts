import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { AnotherExerciseTimerRunningError } from '../errors/another-exercise-timer-running.error'
import { ExerciseTimerAlreadyRunningError } from '../errors/exercise-timer-already-running.error'
import type { ExerciseTimerUnitOfWork } from '../repositories/exercise-timer-unit-of-work'
import { assertSessionBusinessDay } from '../utils/session-business-day'

interface StartExerciseTimerRequest {
  userId: string
  exerciseSessionId: string
}

export class StartExerciseTimerUseCase {
  constructor(private readonly unitOfWork: ExerciseTimerUnitOfWork) {}

  async execute({ userId, exerciseSessionId }: StartExerciseTimerRequest) {
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
        if (exerciseSession.startedAt && !exerciseSession.endedAt) {
          throw new ExerciseTimerAlreadyRunningError()
        }

        const exercisesInSession =
          await exerciseSessions.findByWorkoutSessionId(workoutSession.id)

        const exerciseRunning = exercisesInSession.some(
          (ex) => ex.startedAt && !ex.endedAt
        )

        if (exerciseRunning) {
          throw new AnotherExerciseTimerRunningError()
        }

        const now = new Date()

        const updated = await exerciseSessions.update(exerciseSessionId, {
          startedAt: now,
          endedAt: null,
          duration: null,
        })

        return { exerciseSession: updated }
      }
    )
  }
}
