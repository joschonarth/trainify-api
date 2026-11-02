import type { Exercise, Prisma } from 'generated/prisma'

import type { InMemoryExercisesRepository } from '../../repositories/in-memory/in-memory-exercises.repository'

export function makeExerciseData(
  overrides: Partial<Prisma.ExerciseCreateInput> = {}
): Prisma.ExerciseCreateInput {
  return {
    name: 'Bench Press',
    category: 'CHEST',
    type: 'STRENGTH',
    isCustom: false,
    ...overrides,
  }
}

export async function makeExercise(
  repository: InMemoryExercisesRepository,
  overrides: Partial<Prisma.ExerciseCreateInput> = {}
): Promise<Exercise> {
  return await repository.create(makeExerciseData(overrides))
}
