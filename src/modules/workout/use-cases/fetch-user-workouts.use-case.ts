import type {
  WorkoutListItem,
  WorkoutsRepository,
} from '../repositories/workouts.repository'

interface FetchUserWorkoutsUseCaseRequest {
  userId: string
  page?: number
  pageSize?: number
  search?: string
}

interface FetchUserWorkoutsUseCaseResponse {
  workouts: WorkoutListItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export class FetchUserWorkoutsUseCase {
  constructor(private readonly workoutsRepository: WorkoutsRepository) {}

  async execute({
    userId,
    page = 1,
    pageSize = 20,
    search,
  }: FetchUserWorkoutsUseCaseRequest): Promise<FetchUserWorkoutsUseCaseResponse> {
    const result = await this.workoutsRepository.findPageByUser({
      userId,
      page,
      pageSize,
      ...(search && search.length > 0 && { search }),
    })
    return {
      workouts: result.workouts,
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pageSize),
      },
    }
  }
}
