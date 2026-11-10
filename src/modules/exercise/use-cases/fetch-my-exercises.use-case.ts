import type { ExerciseCategory, ExerciseType } from 'generated/prisma'

import type { MyExercisesRepository } from '../repositories/my-exercises.repository'

interface ExerciseDTO {
  myExerciseId: string
  exerciseId: string
  name: string
  category: ExerciseCategory | null
  type: ExerciseType | null
  isCustom: boolean
  createdAt: Date
  userId: string | null
}

interface FetchMyExercisesUseCaseRequest {
  userId: string
  query: string
  category: ExerciseCategory | null
  page: number
  pageSize: number
}

interface FetchMyExercisesUseCaseResponse {
  items: ExerciseDTO[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export class FetchMyExercisesUseCase {
  constructor(
    private readonly myExercisesRepository: Pick<
      MyExercisesRepository,
      'findAllByUser'
    >
  ) {}

  async execute({
    userId,
    query,
    category,
    page,
    pageSize,
  }: FetchMyExercisesUseCaseRequest): Promise<FetchMyExercisesUseCaseResponse> {
    const { items: myExercises, total } =
      await this.myExercisesRepository.findAllByUser(
        userId,
        query,
        category,
        page,
        pageSize
      )

    const exercises = myExercises.map(
      ({ id: myExerciseId, createdAt, exercise }) => ({
        myExerciseId,
        exerciseId: exercise.id,
        name: exercise.name,
        category: exercise.category,
        type: exercise.type,
        isCustom: exercise.isCustom,
        createdAt,
        userId: exercise.userId,
      })
    )

    return {
      items: exercises,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    }
  }
}
