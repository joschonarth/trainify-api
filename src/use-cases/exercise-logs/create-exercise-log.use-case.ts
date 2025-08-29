import { ExerciseLog } from '@prisma/client'

import { ExerciseLogsRepository } from '@/repositories/exercise-logs.repository'

interface CreateExerciseLogUseCaseRequest {
  userId: string
  exerciseId: string
  sets: number
  reps: number
  weight?: number | null
  description?: string | null
}

interface CreateExerciseLogUseCaseResponse {
  log: ExerciseLog
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
  }: CreateExerciseLogUseCaseRequest): Promise<CreateExerciseLogUseCaseResponse> {
    const log = await this.exerciseLogsRepository.create({
      sets,
      reps,
      weight: weight ?? null,
      description: description ?? null,
      date: new Date(),
      user: { connect: { id: userId } },
      exercise: { connect: { id: exerciseId } },
    })

    return { log }
  }
}
