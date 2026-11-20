import { WorkoutSessionStatus } from 'generated/prisma'
import type { UnlockAllBadgesUseCase } from '@/modules/gamification/badge/use-cases/unlock-all-badges.use-case'
import type { UpdateUserStreakUseCase } from '@/modules/gamification/streak/use-cases/update-user-streak.use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { calculateVolume } from '@/shared/utils/calculate-volume'
import { DuplicateExerciseCompletionError } from '../errors/duplicate-exercise-completion.error'
import { WorkoutSessionAlreadyCompletedError } from '../errors/workout-session-already-completed.error'
import type { ExerciseSessionsRepository } from '../repositories/exercise-sessions.repository'
import type {
  SessionCompletionRepositories,
  SessionCompletionUnitOfWork,
} from '../repositories/session-completion-unit-of-work'
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
  ): WorkoutSessionStatus {
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

    this.assertSessionCanBeCompleted(session)

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

    const now = new Date()
    const processedExerciseSessionIds = new Set<string>()
    const exerciseSessionIdsWithLogs = new Set(
      exerciseSessions
        .filter((exerciseSession) => exerciseSession.logs.length > 0)
        .map((exerciseSession) => exerciseSession.id)
    )

    let anyExerciseCompleted = false
    for (const exercise of exercises) {
      const exerciseSession = exerciseSessions.find(
        (item) => item.id === exercise.exerciseSessionId
      )
      const completed = await this.completeExercise(
        userId,
        exercise,
        exerciseSession,
        now,
        exerciseSessionIdsWithLogs,
        processedExerciseSessionIds,
        repositories
      )
      anyExerciseCompleted ||= completed
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

    return { session: updatedSession, anyExerciseCompleted, logDate: now }
  }

  async execute(
    request: CompleteWorkoutSessionRequest
  ): Promise<CompleteWorkoutSessionResponse> {
    const result = await this.unitOfWork.execute((repositories) =>
      this.completeInTransaction(request, repositories)
    )

    if (result.anyExerciseCompleted) {
      await this.updateUserStreakUseCase.execute({
        userId: request.userId,
        logDate: result.logDate,
      })
    }

    await this.unlockAllBadgesUseCase.execute({ userId: request.userId })

    return { session: result.session }
  }
}
