import { randomUUID } from 'node:crypto'
import type {
  Exercise,
  ExerciseCategory,
  ExerciseType,
  Prisma,
} from 'generated/prisma'
import { Measurement } from 'generated/prisma'

import type { ExercisesRepository } from '../exercises.repository'

const ITEMS_PER_PAGE = 10

function uniqueConstraintError(): Error & { code: 'P2002' } {
  return Object.assign(
    new Error('Unique constraint failed on the fields: (`name`, `user_id`)'),
    { code: 'P2002' as const }
  )
}

function copyExercise(exercise: Exercise): Exercise {
  return { ...exercise, createdAt: new Date(exercise.createdAt) }
}

export class InMemoryExercisesRepository implements ExercisesRepository {
  items: Exercise[] = []

  create(data: Prisma.ExerciseCreateInput): Promise<Exercise> {
    const userId = data.user?.connect?.id ?? null
    const name = data.name.toLowerCase()
    if (
      this.items.some(
        (item) =>
          item.id === data.id ||
          (item.name.toLowerCase() === name &&
            (userId === null
              ? item.userId === null
              : item.userId === userId && item.archivedAt === null))
      )
    ) {
      return Promise.reject(uniqueConstraintError())
    }

    const exercise: Exercise = {
      id: data.id ?? randomUUID(),
      name: data.name,
      category: data.category ?? null,
      type: data.type ?? null,
      measurement: data.measurement ?? Measurement.REPS,
      isCustom: data.isCustom ?? true,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      archivedAt: data.archivedAt ? new Date(data.archivedAt) : null,
      userId,
    }

    this.items.push(exercise)
    return Promise.resolve(copyExercise(exercise))
  }

  findById(id: string, includeArchived = false): Promise<Exercise | null> {
    const exercise = this.items.find(
      (item) => item.id === id && (includeArchived || item.archivedAt === null)
    )
    return Promise.resolve(exercise ? copyExercise(exercise) : null)
  }

  findAllGlobals(
    query: string,
    category: ExerciseCategory | null,
    page = 1
  ): Promise<Exercise[]> {
    const exercises = this.items
      .filter(
        (item) =>
          item.userId === null &&
          !item.isCustom &&
          item.archivedAt === null &&
          (!query || item.name.toLowerCase().includes(query.toLowerCase())) &&
          (!category || item.category === category)
      )
      .sort((left, right) => left.name.localeCompare(right.name))
      .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    return Promise.resolve(exercises.map(copyExercise))
  }

  findByNameAndUser(
    name: string,
    userId: string,
    excludeExerciseId?: string,
    includeArchived = false
  ): Promise<Exercise | null> {
    const exercise = this.items.find(
      (item) =>
        item.id !== excludeExerciseId &&
        item.name.toLowerCase() === name.toLowerCase() &&
        item.userId === userId &&
        item.isCustom &&
        (includeArchived || item.archivedAt === null)
    )
    return Promise.resolve(exercise ? copyExercise(exercise) : null)
  }

  update(
    exerciseId: string,
    data: Partial<{
      name?: string
      category?: ExerciseCategory | null
      type?: ExerciseType | null
    }>
  ): Promise<Exercise> {
    const index = this.items.findIndex((item) => item.id === exerciseId)
    const current = this.items[index]
    if (!current) {
      return Promise.reject(new Error('Record to update not found.'))
    }

    const name = data.name ?? current.name
    if (
      this.items.some(
        (item) =>
          item.id !== current.id &&
          item.name.toLowerCase() === name.toLowerCase() &&
          (current.userId === null
            ? item.userId === null
            : item.userId === current.userId && item.archivedAt === null)
      )
    ) {
      return Promise.reject(uniqueConstraintError())
    }

    const updated: Exercise = {
      ...current,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.type !== undefined && { type: data.type }),
    }
    this.items[index] = updated
    return Promise.resolve(copyExercise(updated))
  }

  archive(exerciseId: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === exerciseId)
    const current = this.items[index]
    if (!current) {
      return Promise.reject(new Error('Record to archive not found.'))
    }

    this.items[index] = {
      ...current,
      archivedAt: new Date(),
      updatedAt: new Date(),
    }
    return Promise.resolve()
  }

  deleteUnlinked(exerciseId: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === exerciseId)
    if (index === -1) {
      return Promise.reject(new Error('Record to delete not found.'))
    }
    this.items.splice(index, 1)
    return Promise.resolve()
  }
}
