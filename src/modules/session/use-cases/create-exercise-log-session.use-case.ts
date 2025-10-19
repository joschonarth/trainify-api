import { ExerciseLog } from '@prisma/client'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { ExerciseLogsRepository } from '@/modules/exercise/repositories/exercise-logs.repository'
import { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'

interface CreateExerciseLogSessionUseCaseRequest {
  userId: string
  sessionId: string
  exerciseId: string
  sets: number
  reps: number
  weight?: number | null
  description?: string | null
}

interface CreateExerciseLogSessionUseCaseResponse {
  exerciseLog: ExerciseLog
}

export class CreateExerciseLogSessionUseCase {
  constructor(
    private exerciseLogsRepository: ExerciseLogsRepository,
    private workoutSessionsRepository: WorkoutSessionsRepository,
  ) {}

  async execute({
    userId,
    sessionId,
    exerciseId,
    sets,
    reps,
    weight,
    description,
  }: CreateExerciseLogSessionUseCaseRequest): Promise<CreateExerciseLogSessionUseCaseResponse> {
    const session =
      await this.workoutSessionsRepository.findByIdWithWorkout(sessionId)

    if (!session || session.userId !== userId) {
      throw new ResourceNotFoundError('Workout session not found.')
    }

    const exerciseInWorkout = session.workout.exercises.find(
      (we) => we.exercise.id === exerciseId,
    )

    if (!exerciseInWorkout) {
      throw new ResourceNotFoundError('Exercise not part of this workout.')
    }

    const exerciseLog = await this.exerciseLogsRepository.create({
      sets,
      reps,
      weight: weight ?? null,
      description: description ?? null,
      date: new Date(),
      user: { connect: { id: userId } },
      exercise: { connect: { id: exerciseId } },
      workout: { connect: { id: session.workoutId } },
      workoutSession: { connect: { id: session.id } },
    })

    return { exerciseLog }
  }
}
