import { randomUUID } from 'node:crypto'
import { type Badge, WorkoutSessionStatus } from 'generated/prisma'
import type { UnlockAllBadgesUseCase } from '@/modules/gamification/badge/use-cases/unlock-all-badges.use-case'
import type { UpdateUserStreakUseCase } from '@/modules/gamification/streak/use-cases/update-user-streak.use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { calculateVolume } from '@/shared/utils/calculate-volume'
import { DuplicateExerciseCompletionError } from '../errors/duplicate-exercise-completion.error'
import { WorkoutSessionAlreadyCompletedError } from '../errors/workout-session-already-completed.error'
import {
  WORKOUT_FINALIZED_V1,
  type WorkoutFinalizedV1,
} from '../events/workout-finalized-v1'
import type { ExerciseSessionsRepository } from '../repositories/exercise-sessions.repository'
import type {
  SessionCompletionRepositories,
  SessionCompletionUnitOfWork,
} from '../repositories/session-completion-unit-of-work'
import type { WorkoutSessionsRepository } from '../repositories/workout-sessions.repository'
import {
  assertSessionBusinessDay,
  getSessionBusinessDay,
} from '../utils/session-business-day'

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
  unlockedBadges: Badge[]
}

type CompletionExercise = CompleteWorkoutSessionRequest['exercises'][number]
type ExerciseSessionRecord = Awaited<
  ReturnType<ExerciseSessionsRepository['findByWorkoutSessionId']>
>[number]

export class CompleteWorkoutSessionUseCase {
  constructor(
    private readonly unitOfWork: SessionCompletionUnitOfWork,
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
  ): WorkoutFinalizedV1['data']['status'] {
    const total = exercises.length
    const completedCount = exercises.filter((ex) => ex.completed).length

    if (completedCount === 0) {
      return WorkoutSessionStatus.SKIPPED
    }
    if (completedCount < total) {
      return WorkoutSessionStatus.INCOMPLETE
    }
    return WorkoutSessionStatus.COMPLETED
  }

  private assertSessionCanBeCompleted(
    session: NonNullable<
      Awaited<ReturnType<WorkoutSessionsRepository['findByIdWithWorkout']>>
    >
  ): void {
    if (
      session.status === WorkoutSessionStatus.COMPLETED ||
      session.status === WorkoutSessionStatus.INCOMPLETE ||
      session.status === WorkoutSessionStatus.SKIPPED ||
      (session.status === WorkoutSessionStatus.PENDING && session.endedAt)
    ) {
      throw new WorkoutSessionAlreadyCompletedError()
    }

    if (
      session.status !== WorkoutSessionStatus.PENDING &&
      session.status !== WorkoutSessionStatus.IN_PROGRESS
    ) {
      throw new WorkoutSessionAlreadyCompletedError()
    }
  }

  private async completeExercise(
    userId: string,
    exercise: CompletionExercise,
    exerciseSession: ExerciseSessionRecord | undefined,
    now: Date,
    exerciseSessionIdsWithLogs: Set<string>,
    processedExerciseSessionIds: Set<string>,
    repositories: SessionCompletionRepositories
  ): Promise<boolean> {
    if (
      !exerciseSession ||
      processedExerciseSessionIds.has(exerciseSession.id)
    ) {
      return false
    }
    processedExerciseSessionIds.add(exerciseSession.id)

    if (
      exercise.completed &&
      !exerciseSessionIdsWithLogs.has(exerciseSession.id)
    ) {
      const volume = calculateVolume(
        exercise.sets,
        exercise.reps,
        exercise.weight,
        exerciseSession.exercise.measurement
      )

      await repositories.exerciseLogs.create({
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

    await repositories.exerciseSessions.update(exercise.exerciseSessionId, {
      completed: exercise.completed,
      skipReason: exercise.completed ? null : (exercise.skipReason ?? null),
    })

    return exercise.completed
  }

  private async completeInTransaction(
    { userId, sessionId, exercises }: CompleteWorkoutSessionRequest,
    repositories: SessionCompletionRepositories
  ) {
    const session =
      await repositories.workoutSessions.findByIdWithWorkout(sessionId)

    if (!session || session.userId !== userId) {
      throw new ResourceNotFoundError(
        'Workout session not found or does not belong to user.'
      )
    }

    const completion = await repositories.completions.findBySessionId(sessionId)
    if (completion) {
      return {
        session,
        anyExerciseCompleted: completion.hasActivity,
        logDate: completion.completedAt,
        creditDay:
          completion.businessDate && completion.timezone
            ? {
                businessDate: completion.businessDate,
                timezone: completion.timezone,
              }
            : undefined,
      }
    }

    this.assertSessionCanBeCompleted(session)
    const now = new Date()
    assertSessionBusinessDay(session, now)

    const exerciseSessions =
      await repositories.exerciseSessions.findByWorkoutSessionId(sessionId)

    if (!exerciseSessions.length) {
      throw new ResourceNotFoundError('No exercises found for this session.')
    }

    const exerciseSessionIds = new Set(
      exerciseSessions.map((exerciseSession) => exerciseSession.id)
    )
    const submittedExerciseSessionIds = new Set<string>()

    for (const exercise of exercises) {
      if (submittedExerciseSessionIds.has(exercise.exerciseSessionId)) {
        throw new DuplicateExerciseCompletionError()
      }

      submittedExerciseSessionIds.add(exercise.exerciseSessionId)

      if (!exerciseSessionIds.has(exercise.exerciseSessionId)) {
        throw new ResourceNotFoundError('Exercise session not found.')
      }
    }

    const processedExerciseSessionIds = new Set<string>()
    const exerciseSessionIdsWithLogs = new Set(
      exerciseSessions
        .filter((exerciseSession) => exerciseSession.logs.length > 0)
        .map((exerciseSession) => exerciseSession.id)
    )

    for (const exercise of exercises) {
      const exerciseSession = exerciseSessions.find(
        (item) => item.id === exercise.exerciseSessionId
      )
      await this.completeExercise(
        userId,
        exercise,
        exerciseSession,
        now,
        exerciseSessionIdsWithLogs,
        processedExerciseSessionIds,
        repositories
      )
    }

    const updatedExerciseSessions =
      await repositories.exerciseSessions.findByWorkoutSessionId(sessionId)

    const newStatus = this.deriveSessionStatus(updatedExerciseSessions)

    const endedAt = session.endedAt ?? now
    const duration =
      session.duration ??
      Math.floor(
        (endedAt.getTime() - (session.startedAt ?? endedAt).getTime()) / 1000
      )
    await repositories.workoutSessions.update(sessionId, {
      endedAt,
      duration,
      status: newStatus,
    })

    const updatedSession =
      await repositories.workoutSessions.findByIdWithWorkout(sessionId)

    if (!updatedSession) {
      throw new ResourceNotFoundError('Failed to retrieve updated session.')
    }

    const anyExerciseCompleted = updatedExerciseSessions.some(
      (exercise) => exercise.completed
    )
    const creditDay = getSessionBusinessDay(session)
    await repositories.completions.create({
      sessionId,
      completedAt: now,
      hasActivity: anyExerciseCompleted,
      ...creditDay,
    })

    const eventId = randomUUID()
    const occurredAt = now.toISOString()
    await repositories.outbox.create({
      eventId,
      type: WORKOUT_FINALIZED_V1,
      occurredAt,
      correlationId: eventId,
      data: {
        sessionId,
        userId,
        status: newStatus,
        hasActivity: anyExerciseCompleted,
        completedAt: occurredAt,
        ...creditDay,
      },
    })
    await repositories.processings.createPending({ eventId, sessionId, userId })

    return {
      session: updatedSession,
      anyExerciseCompleted,
      logDate: now,
      creditDay,
    }
  }

  async execute(
    request: CompleteWorkoutSessionRequest
  ): Promise<CompleteWorkoutSessionResponse> {
    const result = await this.unitOfWork.execute(
      request.sessionId,
      (repositories) => this.completeInTransaction(request, repositories)
    )

    if (result.anyExerciseCompleted) {
      await this.updateUserStreakUseCase.execute({
        userId: request.userId,
        logDate: result.logDate,
        ...(result.creditDay ? { creditDay: result.creditDay } : {}),
      })
    }

    // Rewards are recoverable post-commit work; failures do not roll back completion.
    const { badges } = await this.unlockAllBadgesUseCase.execute({
      userId: request.userId,
    })

    return { session: result.session, unlockedBadges: badges }
  }
}
