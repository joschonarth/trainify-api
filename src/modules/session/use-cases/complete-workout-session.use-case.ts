import { WorkoutSessionStatus } from '@prisma/client'

import { ExerciseLogsRepository } from '@/modules/exercise/repositories/exercise-logs.repository'
import { UnlockAllBadgesUseCase } from '@/modules/gamification/use-cases/unlock-all-badges.use-case'
import { UpdateUserStreakUseCase } from '@/modules/gamification/use-cases/update-user-streak.use-case'
import { ExerciseSessionsRepository } from '@/modules/session/repositories/exercise-sessions.repository'
import { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

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

  private deriveSessionStatus(
    exercises: { completed: boolean }[],
  ): WorkoutSessionStatus {
    const total = exercises.length
    const completedCount = exercises.filter((ex) => ex.completed).length

    if (completedCount === 0) return WorkoutSessionStatus.PENDING
    if (completedCount < total) return WorkoutSessionStatus.INCOMPLETE
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
        'Workout session not found or does not belong to user.',
      )
    }

    const exerciseSessions =
      await this.exerciseSessionsRepository.findByWorkoutSessionId(sessionId)
    if (!exerciseSessions.length) {
      throw new ResourceNotFoundError('No exercises found for this session.')
    }

    for (const exercise of exercises) {
      const exerciseSession = exerciseSessions.find(
        (ex) => ex.id === exercise.exerciseSessionId,
      )
      if (!exerciseSession) continue

      await this.exerciseLogsRepository.create({
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight ?? null,
        description: exercise.note ?? null,
        date: new Date(),
        user: { connect: { id: userId } },
        exercise: { connect: { id: exerciseSession.exercise.id } },
        exerciseSession: { connect: { id: exercise.exerciseSessionId } },
      })

      await this.exerciseSessionsRepository.update(exercise.exerciseSessionId, {
        completed: exercise.completed,
      })
    }

    const updatedExerciseSessions =
      await this.exerciseSessionsRepository.findByWorkoutSessionId(sessionId)
    const newStatus = this.deriveSessionStatus(updatedExerciseSessions)

    await this.workoutSessionsRepository.updateStatus(sessionId, newStatus)

    if (newStatus === WorkoutSessionStatus.COMPLETED) {
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
