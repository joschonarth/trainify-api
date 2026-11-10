import type { ExercisesRepository } from '../repositories/exercises.repository'
import type { DeleteCustomExerciseUseCase } from './delete-custom-exercise.use-case'
import type { RemoveCatalogExerciseUseCase } from './remove-catalog-exercise.use-case'

interface RemoveExerciseFromLibraryUseCaseRequest {
  userId: string
  exerciseId: string
}

export class RemoveExerciseFromLibraryUseCase {
  constructor(
    private readonly exercisesRepository: Pick<ExercisesRepository, 'findById'>,
    private readonly deleteCustomExerciseUseCase: Pick<
      DeleteCustomExerciseUseCase,
      'execute'
    >,
    private readonly removeCatalogExerciseUseCase: Pick<
      RemoveCatalogExerciseUseCase,
      'execute'
    >
  ) {}

  async execute({
    userId,
    exerciseId,
  }: RemoveExerciseFromLibraryUseCaseRequest): Promise<void> {
    const exercise = await this.exercisesRepository.findById(exerciseId)

    if (exercise?.isCustom) {
      await this.deleteCustomExerciseUseCase.execute({ userId, exerciseId })
      return
    }

    await this.removeCatalogExerciseUseCase.execute({ userId, exerciseId })
  }
}
