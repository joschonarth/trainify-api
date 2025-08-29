import { Exercise } from '@prisma/client'

import { NotAllowedError } from '@/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { ExercisesRepository } from '@/repositories/exercises.repository'

interface UpdateExerciseUseCaseRequest {
  userId: string
  exerciseId: string
  name?: string | null | undefined
  category?: string | null | undefined
  type?: string | null | undefined
  sets?: number | null | undefined
  reps?: number | null | undefined
  weight?: number | null | undefined
}

interface UpdateExerciseUseCaseResponse {
  exercise: Exercise
}

export class UpdateExerciseUseCase {
  constructor(private exercisesRepository: ExercisesRepository) {}

  async execute({
    userId,
    exerciseId,
    name,
    category,
    type,
    sets,
    reps,
    weight,
  }: UpdateExerciseUseCaseRequest): Promise<UpdateExerciseUseCaseResponse> {
    const exercise = await this.exercisesRepository.findById(exerciseId)

    if (!exercise) {
      throw new ResourceNotFoundError('Exercise not found.')
    }

    if (!exercise.isCustom) {
      throw new NotAllowedError('Catalog exercises cannot be updated.')
    }

    if (exercise.userId !== userId) {
      throw new NotAllowedError('You can only update your own exercises.')
    }

    const updatedExercise = await this.exercisesRepository.update(exerciseId, {
      name: name ?? exercise.name,
      category: category ?? exercise.category,
      type: type ?? exercise.type,
      sets: sets ?? exercise.sets,
      reps: reps ?? exercise.reps,
      weight: weight ?? exercise.weight,
    })

    return { exercise: updatedExercise }
  }
}
