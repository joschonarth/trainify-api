import type { ExerciseLog } from '@prisma/client'
import dayjs from 'dayjs'

import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'

import type { ExerciseLogsRepository } from '../repositories/exercise-logs.repository'

interface CreateExerciseLogUseCaseRequest {
  userId: string
  exerciseId: string
  sets: number
  reps: number
  weight?: number | null
  description?: string | null
  date?: Date | null
}

interface CreateExerciseLogUseCaseResponse {
  exerciseLog: ExerciseLog
}

export class CreateExerciseLogUseCase {
  constructor(private exerciseLogsRepository: ExerciseLogsRepository) {}

  async execute({
    userId,
    exerciseId,
    sets,
    reps,
    weight,
    description,
    date = new Date(),
  }: CreateExerciseLogUseCaseRequest): Promise<CreateExerciseLogUseCaseResponse> {
    const startOfDay = dayjs(date).startOf('day').toDate()
    const endOfDay = dayjs(date).endOf('day').toDate()

    const existingLog =
      await this.exerciseLogsRepository.findByUserAndExerciseBetweenDates(
        userId,
        exerciseId,
        startOfDay,
        endOfDay
      )

    if (existingLog) {
      throw new ResourceAlreadyExistsError(
        'Exercise log for this exercise already exists today.'
      )
    }

    const exerciseLog = await this.exerciseLogsRepository.create({
      sets,
      reps,
      weight: weight ?? null,
      description: description ?? null,
      date: new Date(),
      user: { connect: { id: userId } },
      exercise: { connect: { id: exerciseId } },
    })

    return { exerciseLog }
  }
}
