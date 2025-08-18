import { Exercise } from '@prisma/client'

import { ExercisesRepository } from '@/repositories/exercises.repository'

interface CreateExerciseUseCaseRequest {
  userId: string
  name: string
  category?: string | undefined
  type?: string | undefined
  sets?: number | undefined
  reps?: number | undefined
  weight?: number | undefined
}

interface CreateExerciseUseCaseResponse {
  exercise: Exercise
}

export class CreateExerciseUseCase {
  constructor(private exercisesRepository: ExercisesRepository) {}

  async execute({
    userId,
    name,
    category,
    type,
    sets,
    reps,
    weight,
  }: CreateExerciseUseCaseRequest): Promise<CreateExerciseUseCaseResponse> {
    const exercise = await this.exercisesRepository.create({
      name,
      category: category ?? null,
      type: type ?? null,
      isCustom: true,
      sets: sets ?? null,
      reps: reps ?? null,
      weight: weight ?? null,
      createdAt: new Date(),
      user: { connect: { id: userId } },
    })

    return { exercise }
  }
}
