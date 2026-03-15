import type { Workout } from 'generated/prisma'

import type { WorkoutsRepository } from '../repositories/workouts.repository'

interface CreateWorkoutUseCaseRequest {
  name: string
  description: string | null
  userId: string
}

interface CreateWorkoutUseCaseResponse {
  workout: Workout
}

export class CreateWorkoutUseCase {
  constructor(private readonly workoutsRepository: WorkoutsRepository) {}

  async execute({
    name,
    description,
    userId,
  }: CreateWorkoutUseCaseRequest): Promise<CreateWorkoutUseCaseResponse> {
    const workout = await this.workoutsRepository.create({
      name,
      description,
      user: {
        connect: { id: userId },
      },
    })

    return { workout }
  }
}
