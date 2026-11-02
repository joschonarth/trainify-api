import type { MyExercise } from 'generated/prisma'

import type { InMemoryMyExercisesRepository } from '../../repositories/in-memory/in-memory-my-exercises.repository'

export async function makeMyExercise(
  repository: InMemoryMyExercisesRepository,
  userId = 'user-id',
  exerciseId = 'exercise-id'
): Promise<MyExercise> {
  return await repository.addExercise(userId, exerciseId)
}
