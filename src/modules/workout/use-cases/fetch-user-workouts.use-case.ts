import type { Workout } from 'generated/prisma'

import type { WorkoutsRepository } from '../repositories/workouts.repository'

interface FetchUserWorkoutsUseCaseRequest {
  userId: string
}

interface FetchUserWorkoutsUseCaseResponse {
  workouts: (Workout & {
    exercises: {
      id: string
      exerciseId: string
      defaultSets: number | null
      defaultReps: number | null
      defaultWeight: number | null
      exercise: {
        id: string
        name: string
        category: string | null
        type: string | null
      }
    }[]
    schedules: {
      id: string
      dayOfWeek: number
    }[]
  })[]
}

export class FetchUserWorkoutsUseCase {
  constructor(private readonly workoutsRepository: WorkoutsRepository) {}

  async execute({
    userId,
  }: FetchUserWorkoutsUseCaseRequest): Promise<FetchUserWorkoutsUseCaseResponse> {
    const workouts = await this.workoutsRepository.findAllByUser(userId)
    return { workouts }
  }
}
