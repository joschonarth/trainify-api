import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { MyExercisesRepository } from '../repositories/my-exercises.repository'
export class SetExerciseFavoriteUseCase {
  constructor(
    private readonly repository: Pick<MyExercisesRepository, 'setFavorite'>
  ) {}
  async execute({
    userId,
    exerciseId,
    isFavorite,
  }: {
    userId: string
    exerciseId: string
    isFavorite: boolean
  }) {
    const item = await this.repository.setFavorite(
      userId,
      exerciseId,
      isFavorite
    )
    if (!item) {
      throw new ResourceNotFoundError('Exercise not found.')
    }
    return { exerciseId: item.exerciseId, isFavorite: item.isFavorite }
  }
}
