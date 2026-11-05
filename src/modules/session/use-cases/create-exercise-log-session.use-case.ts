import type { ExerciseLog } from 'generated/prisma'

import type { ExerciseLogsRepository } from '@/modules/exercise/repositories/exercise-logs.repository'
import type { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

interface CreateExerciseLogSessionUseCaseRequest {
  userId: string
  sessionId: string
  exerciseId: string
  sets: number
  reps: number
  weight?: number | null
  description?: string | null
  date?: Date
}

interface CreateExerciseLogSessionUseCaseResponse {
  exerciseLog: ExerciseLog
}

export class CreateExerciseLogSessionUseCase {
  constructor(
    private readonly exerciseLogsRepository: Pick<
      ExerciseLogsRepository,
      'create'
    >,
    private readonly workoutSessionsRepository: Pick<
      WorkoutSessionsRepository,
      'findByIdWithWorkout'
    >
  ) {}

  async execute({
    userId,
    sessionId,
    exerciseId,
    sets,
    reps,
    weight,
    description,
    date,
  }: CreateExerciseLogSessionUseCaseRequest): Promise<CreateExerciseLogSessionUseCaseResponse> {
    const session =
      await this.workoutSessionsRepository.findByIdWithWorkout(sessionId)

    if (!session || session.userId !== userId) {
      throw new ResourceNotFoundError('Workout session not found.')
    }

    const exerciseSession = session.exerciseSessions.find(
      (exerciseSession) => exerciseSession.exercise.id === exerciseId
    )

    if (!exerciseSession) {
      throw new ResourceNotFoundError('Exercise not part of this workout.')
    }

    const exerciseLog = await this.exerciseLogsRepository.create({
      sets,
      reps,
      weight: weight ?? null,
      description: description ?? null,
      date: date ?? new Date(),
      user: { connect: { id: userId } },
      exercise: { connect: { id: exerciseId } },
      exerciseSession: { connect: { id: exerciseSession.id } },
    })

    return { exerciseLog }
  }
}
