import { Exercise, MyExercise } from '@prisma/client'

import { ResourceAlreadyExistsError } from '@/errors/resource-already-exists.error'
import { ExercisesRepository } from '@/repositories/exercises.repository'
import { MyExercisesRepository } from '@/repositories/my-exercises.repository'

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
  myExercise: MyExercise
}

export class CreateExerciseUseCase {
  constructor(
    private exercisesRepository: ExercisesRepository,
    private myExercisesRepository: MyExercisesRepository,
  ) {}

  async execute({
    userId,
    name,
    category,
    type,
    sets,
    reps,
    weight,
  }: CreateExerciseUseCaseRequest): Promise<CreateExerciseUseCaseResponse> {
    const existingExercise = await this.exercisesRepository.findByNameAndUser(
      name,
      userId,
    )

    if (existingExercise) {
      throw new ResourceAlreadyExistsError(
        'Exercise with this name already exists.',
      )
    }

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

    const myExercise = await this.myExercisesRepository.addExercise(
      userId,
      exercise.id,
    )

    return { exercise, myExercise }
  }
}
