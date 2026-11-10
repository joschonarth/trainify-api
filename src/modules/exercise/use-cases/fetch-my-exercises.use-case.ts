import type { ExerciseCategory, ExerciseType } from 'generated/prisma'

import type { MyExercisesRepository } from '../repositories/my-exercises.repository'

interface ExerciseDTO {
  myExerciseId: string
  exerciseId: string
  name: string
  category: ExerciseCategory | null
  type: ExerciseType | null
  isCustom: boolean
  addedAt: Date
  userId: string | null
}

interface FetchMyExercisesUseCaseRequest {
  userId: string
  q: string
  category: ExerciseCategory | null
  type: ExerciseType | null
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
    q,
    category,
    type,
    page,
    pageSize,
  }: FetchMyExercisesUseCaseRequest): Promise<FetchMyExercisesUseCaseResponse> {
    const { items: myExercises, total } =
      await this.myExercisesRepository.findAllByUser(
        userId,
        q,
        category,
        page,
        pageSize,
        type
      )

    const exercises = myExercises.map(
      ({ id: myExerciseId, createdAt: addedAt, exercise }) => ({
        myExerciseId,
        exerciseId: exercise.id,
        name: exercise.name,
        category: exercise.category,
        type: exercise.type,
        isCustom: exercise.isCustom,
        addedAt,
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
