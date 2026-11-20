import type {
  Exercise,
  ExerciseCategory,
  ExerciseType,
  Measurement,
} from 'generated/prisma'
import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { ExercisesRepository } from '../repositories/exercises.repository'

type Status = 'active' | 'archived' | 'all'

export class AdminGlobalExercisesUseCase {
  constructor(private readonly repository: ExercisesRepository) {}

  async list(input: {
    query: string
    category: ExerciseCategory | null
    status: Status
    page: number
  }) {
    return { exercises: await this.repository.findAllGlobalsForAdmin(input) }
  }

  async get(exerciseId: string): Promise<{ exercise: Exercise }> {
    const exercise = await this.repository.findGlobalById(exerciseId, true)
    if (!exercise) {
      throw new ResourceNotFoundError('Global exercise not found.')
    }
    return { exercise }
  }

  async create(input: {
    name: string
    category: ExerciseCategory | null
    type: ExerciseType | null
    measurement: Measurement
  }): Promise<{ exercise: Exercise }> {
    const name = input.name.trim()
    if (await this.repository.findGlobalByName(name)) {
      throw new ResourceAlreadyExistsError(
        'Global exercise with this name already exists.'
      )
    }
    try {
      return {
        exercise: await this.repository.create({
          name,
          category: input.category,
          type: input.type,
          measurement: input.measurement,
          isCustom: false,
        }),
      }
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ResourceAlreadyExistsError(
          'Global exercise with this name already exists.'
        )
      }
      throw error
    }
  }

  async update(input: {
    exerciseId: string
    name?: string
    category?: ExerciseCategory | null
    type?: ExerciseType | null
  }) {
    const current = await this.repository.findGlobalById(input.exerciseId, true)
    if (!current) {
      throw new ResourceNotFoundError('Global exercise not found.')
    }
    if (current.archivedAt) {
      throw new ResourceAlreadyExistsError(
        'Archived global exercises must be restored before editing.'
      )
    }
    const name = input.name?.trim()
    if (name && (await this.repository.findGlobalByName(name, current.id))) {
      throw new ResourceAlreadyExistsError(
        'Global exercise with this name already exists.'
      )
    }
    try {
      return {
        exercise: await this.repository.update(current.id, {
          ...(name !== undefined && { name }),
          ...(input.category !== undefined && { category: input.category }),
          ...(input.type !== undefined && { type: input.type }),
        }),
      }
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ResourceAlreadyExistsError(
          'Global exercise with this name already exists.'
        )
      }
      throw error
    }
  }
}
