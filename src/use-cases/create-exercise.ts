import { Exercise } from '@prisma/client'

import { ExercisesRepository } from '@/repositories/exercises.repository'

interface CreateExerciseUseCaseRequest {
  userId: string
  name: string
  category: string | null
  type: string | null
  sets: number | null
  reps: number | null
  weight: number | null
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
      category,
      type,
      isCustom: true,
      sets,
      reps,
      weight,
      createdAt: new Date(),
      user: { connect: { id: userId } },
    })

    return { exercise }
  }
}
