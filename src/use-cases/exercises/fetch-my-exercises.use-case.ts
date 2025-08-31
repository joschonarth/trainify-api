import { ExerciseCategory, ExerciseType } from '@prisma/client'

import { MyExercisesRepository } from '@/repositories/my-exercises.repository'

interface ExerciseDTO {
  myExerciseId: string
  exerciseId: string
  name: string
  category: ExerciseCategory | null
  type: ExerciseType | null
  sets: number | null
  reps: number | null
  weight: number | null
  isCustom: boolean
  createdAt: Date
  userId: string | null
}

interface FetchMyExercisesUseCaseRequest {
  userId: string
  query: string
  category: ExerciseCategory
  page: number
}

interface FetchMyExercisesUseCaseResponse {
  myExercises: ExerciseDTO[]
}

export class FetchMyExercisesUseCase {
  constructor(private myExercisesRepository: MyExercisesRepository) {}

  async execute({
    userId,
    query,
    category,
    page,
  }: FetchMyExercisesUseCaseRequest): Promise<FetchMyExercisesUseCaseResponse> {
    const myExercises = await this.myExercisesRepository.findAllByUser(
      userId,
      query,
      category,
      page,
    )

    const exercises = myExercises.map(({ id: myExerciseId, exercise }) => ({
      myExerciseId,
      exerciseId: exercise.id,
      name: exercise.name,
      category: exercise.category,
      type: exercise.type,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      isCustom: exercise.isCustom,
      createdAt: exercise.createdAt,
      userId: exercise.userId,
    }))

    return { myExercises: exercises }
  }
}
