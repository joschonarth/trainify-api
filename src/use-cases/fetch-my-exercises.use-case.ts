import { MyExercise } from '@prisma/client'

import { MyExercisesRepository } from '@/repositories/my-exercises.repository'

interface FetchMyExercisesUseCaseResponse {
  myExercises: MyExercise[]
}

export class FetchMyExercisesUseCase {
  constructor(private myExercisesRepository: MyExercisesRepository) {}

  async execute(userId: string): Promise<FetchMyExercisesUseCaseResponse> {
    const myExercises = await this.myExercisesRepository.findAllByUser(userId)
    return { myExercises }
  }
}
