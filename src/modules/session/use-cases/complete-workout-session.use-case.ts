import { WorkoutSessionStatus } from 'generated/prisma'

import type { ExerciseLogsRepository } from '@/modules/exercise/repositories/exercise-logs.repository'
import type { UnlockAllBadgesUseCase } from '@/modules/gamification/use-cases/unlock-all-badges.use-case'
import type { UpdateUserStreakUseCase } from '@/modules/gamification/use-cases/update-user-streak.use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { WorkoutSessionAlreadyCompletedError } from '../errors/workout-session-already-completed.error'

import type { ExerciseSessionsRepository } from '../repositories/exercise-sessions.repository'
import type { WorkoutSessionsRepository } from '../repositories/workout-sessions.repository'

interface CompleteWorkoutSessionRequest {
  userId: string
  sessionId: string
  exercises: {
    exerciseSessionId: string
    sets: number
    reps: number
    weight?: number | undefined
    note?: string | undefined
    completed: boolean
    skipReason?: string | undefined
  }[]
}

interface CompleteWorkoutSessionResponse {
  session: Awaited<ReturnType<WorkoutSessionsRepository['findByIdWithWorkout']>>
}

export class CompleteWorkoutSessionUseCase {
  constructor(
    private readonly workoutSessionsRepository: Pick<
      WorkoutSessionsRepository,
      'findByIdWithWorkout' | 'update' | 'updateStatus'
    >,
    private readonly exerciseSessionsRepository: Pick<
      ExerciseSessionsRepository,
      'findByWorkoutSessionId' | 'update'
    >,
    private readonly exerciseLogsRepository: Pick<
      ExerciseLogsRepository,
      'create'
    >,
    private readonly updateUserStreakUseCase: Pick<
      UpdateUserStreakUseCase,
      'execute'
    >,
    private readonly unlockAllBadgesUseCase: Pick<
      UnlockAllBadgesUseCase,
      'execute'
    >
  ) {}

  private deriveSessionStatus(
    exercises: { completed: boolean }[]
  ): WorkoutSessionStatus {
    const total = exercises.length
    const completedCount = exercises.filter((ex) => ex.completed).length

    if (completedCount === 0) {
      return WorkoutSessionStatus.PENDING
    }
    if (completedCount < total) {
      return WorkoutSessionStatus.INCOMPLETE
    }
    return WorkoutSessionStatus.COMPLETED
  }

  async execute({
    userId,
    sessionId,
    exercises,
  }: CompleteWorkoutSessionRequest): Promise<CompleteWorkoutSessionResponse> {
    const session =
      await this.workoutSessionsRepository.findByIdWithWorkout(sessionId)

    if (!session || session.userId !== userId) {
      throw new ResourceNotFoundError(
        'Workout session not found or does not belong to user.'
      )
    }

    if (session.status === WorkoutSessionStatus.COMPLETED) {
      throw new WorkoutSessionAlreadyCompletedError()
    }

    if (!session.endedAt && session.startedAt) {
      const now = new Date()

      const duration = Math.floor(
        (now.getTime() - session.startedAt.getTime()) / 1000
      )
      await this.workoutSessionsRepository.update(sessionId, {
        endedAt: now,
        duration,
      })
    }

    const exerciseSessions =
      await this.exerciseSessionsRepository.findByWorkoutSessionId(sessionId)

    if (!exerciseSessions.length) {
      throw new ResourceNotFoundError('No exercises found for this session.')
    }

    let anyExerciseCompleted = false
    const now = new Date()
    const exerciseSessionIdsWithLogs = new Set(
      exerciseSessions
        .filter((item) => item.logs.length > 0)
        .map((item) => item.id)
    )

    for (const exercise of exercises) {
      const exerciseSession = exerciseSessions.find(
        (ex) => ex.id === exercise.exerciseSessionId
      )
      if (!exerciseSession) {
        continue
      }

      if (
        exercise.completed &&
        !exerciseSessionIdsWithLogs.has(exerciseSession.id)
      ) {
        const weight = exercise.weight ?? 0
        const volume = exercise.sets * exercise.reps * weight

        await this.exerciseLogsRepository.create({
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight ?? null,
          volume,
          description: exercise.note ?? null,
          date: now,
          user: { connect: { id: userId } },
          exercise: { connect: { id: exerciseSession.exercise.id } },
          exerciseSession: { connect: { id: exercise.exerciseSessionId } },
        })
        exerciseSessionIdsWithLogs.add(exerciseSession.id)
      }

      await this.exerciseSessionsRepository.update(exercise.exerciseSessionId, {
        completed: exercise.completed,
        skipReason: exercise.completed ? null : (exercise.skipReason ?? null),
      })

      if (exercise.completed) {
        anyExerciseCompleted = true
      }
    }

    const updatedExerciseSessions =
      await this.exerciseSessionsRepository.findByWorkoutSessionId(sessionId)

    const newStatus = this.deriveSessionStatus(updatedExerciseSessions)

    await this.workoutSessionsRepository.updateStatus(sessionId, newStatus)

    if (anyExerciseCompleted) {
      await this.updateUserStreakUseCase.execute({
        userId,
        logDate: now,
      })
    }

    await this.unlockAllBadgesUseCase.execute({ userId })

    const updatedSession =
      await this.workoutSessionsRepository.findByIdWithWorkout(sessionId)

    if (!updatedSession) {
      throw new ResourceNotFoundError('Failed to retrieve updated session.')
    }

    return { session: updatedSession }
  }
}
