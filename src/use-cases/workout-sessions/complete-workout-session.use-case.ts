import { WorkoutSessionStatus } from '@prisma/client'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { ExerciseLogsRepository } from '@/repositories/exercise-logs.repository'
import { ExerciseSessionsRepository } from '@/repositories/exercise-sessions.repository'
import { WorkoutSessionsRepository } from '@/repositories/workout-sessions.repository'

import { UnlockAllBadgesUseCase } from '../../modules/gamification/use-cases/unlock-all-badges.use-case'
import { UpdateUserStreakUseCase } from '../../modules/gamification/use-cases/update-user-streak.use-case'

interface CompleteWorkoutSessionRequest {
  userId: string
  sessionId: string
  status: WorkoutSessionStatus
  exercises: {
    exerciseSessionId: string
    sets: number
    reps: number
    weight?: number | undefined
    note?: string | undefined
    completed: boolean
  }[]
}

interface CompleteWorkoutSessionResponse {
  session: Awaited<ReturnType<WorkoutSessionsRepository['findByIdWithWorkout']>>
}

export class CompleteWorkoutSessionUseCase {
  constructor(
    private workoutSessionsRepository: WorkoutSessionsRepository,
    private exerciseSessionsRepository: ExerciseSessionsRepository,
    private exerciseLogsRepository: ExerciseLogsRepository,

    private updateUserStreakUseCase: UpdateUserStreakUseCase,
    private unlockAllBadgesUseCase: UnlockAllBadgesUseCase,
  ) {}

  async execute({
    userId,
    sessionId,
    status,
    exercises,
  }: CompleteWorkoutSessionRequest): Promise<CompleteWorkoutSessionResponse> {
    const session =
      await this.workoutSessionsRepository.findByIdWithWorkout(sessionId)

    if (!session || session.userId !== userId) {
      throw new ResourceNotFoundError(
        'Workout session not found or does not belong to the user.',
      )
    }

    await this.workoutSessionsRepository.updateStatus(sessionId, status)

    for (const ex of exercises) {
      const exerciseSession = await this.exerciseSessionsRepository.findById(
        ex.exerciseSessionId,
      )
      if (!exerciseSession) continue

      await this.exerciseSessionsRepository.update({
        id: ex.exerciseSessionId,
        completed: ex.completed,
      })

      const existingLog =
        await this.exerciseLogsRepository.findByExerciseSession(
          ex.exerciseSessionId,
        )

      if (existingLog) {
        await this.exerciseLogsRepository.update(existingLog.id, {
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight ?? null,
          description: ex.note ?? null,
          date: new Date(),
        })
      } else {
        await this.exerciseLogsRepository.create({
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight ?? null,
          description: ex.note ?? null,
          date: new Date(),
          user: { connect: { id: userId } },
          exercise: { connect: { id: exerciseSession.exerciseId } },
          exerciseSession: { connect: { id: ex.exerciseSessionId } },
        })
      }
    }

    if (status === WorkoutSessionStatus.COMPLETED) {
      await this.updateUserStreakUseCase.execute({
        userId,
        workoutDate: new Date(),
      })
    }

    await this.unlockAllBadgesUseCase.execute({ userId })

    const updatedSession =
      await this.workoutSessionsRepository.findByIdWithWorkout(sessionId)

    if (!updatedSession) {
      throw new Error('Failed to retrieve updated session.')
    }

    return { session: updatedSession }
  }
}
