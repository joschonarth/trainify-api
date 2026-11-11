import { WorkoutSessionStatus } from 'generated/prisma'

import type { ExerciseLogsRepository } from '@/modules/exercise/repositories/exercise-logs.repository'
import type { UnlockAllBadgesUseCase } from '@/modules/gamification/use-cases/unlock-all-badges.use-case'
import type { UpdateUserStreakUseCase } from '@/modules/gamification/use-cases/update-user-streak.use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { calculateVolume } from '@/shared/utils/calculate-volume'

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

type CompletionExercise = CompleteWorkoutSessionRequest['exercises'][number]
type ExerciseSessionRecord = Awaited<
  ReturnType<ExerciseSessionsRepository['findByWorkoutSessionId']>
>[number]

export class CompleteWorkoutSessionUseCase {
  constructor(
    private readonly workoutSessionsRepository: Pick<
      WorkoutSessionsRepository,
      'findByIdWithWorkout' | 'update'
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
  }

  private async completeExercise(
    userId: string,
    exercise: CompletionExercise,
    exerciseSession: ExerciseSessionRecord | undefined,
    now: Date,
    exerciseSessionIdsWithLogs: Set<string>,
    processedExerciseSessionIds: Set<string>
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
        exercise.weight
      )

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

    return exercise.completed
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

    this.assertSessionCanBeCompleted(session)

    const exerciseSessions =
      await this.exerciseSessionsRepository.findByWorkoutSessionId(sessionId)

    if (!exerciseSessions.length) {
      throw new ResourceNotFoundError('No exercises found for this session.')
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
        processedExerciseSessionIds
      )
      anyExerciseCompleted ||= completed
    }

    const updatedExerciseSessions =
      await this.exerciseSessionsRepository.findByWorkoutSessionId(sessionId)

    const newStatus = this.deriveSessionStatus(updatedExerciseSessions)

    const endedAt = session.endedAt ?? now
    const duration =
      session.duration ??
      Math.floor(
        (endedAt.getTime() - (session.startedAt ?? endedAt).getTime()) / 1000
      )
    await this.workoutSessionsRepository.update(sessionId, {
      endedAt,
      duration,
      status: newStatus,
    })

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
