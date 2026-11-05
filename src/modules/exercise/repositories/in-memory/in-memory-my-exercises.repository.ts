import { randomUUID } from 'node:crypto'
import type { Exercise, MyExercise, Prisma } from 'generated/prisma'

import type { ExercisesRepository } from '../exercises.repository'
import type { MyExercisesRepository } from '../my-exercises.repository'

const ITEMS_PER_PAGE = 10

function uniqueConstraintError(): Error & { code: 'P2002' } {
  return Object.assign(
    new Error(
      'Unique constraint failed on the fields: (`user_id`, `exercise_id`)'
    ),
    { code: 'P2002' as const }
  )
}

export class InMemoryMyExercisesRepository implements MyExercisesRepository {
  items: MyExercise[] = []

  constructor(private readonly exercisesRepository: ExercisesRepository) {}

  async createCustomExerciseWithLibraryEntry(
    userId: string,
    data: Omit<Prisma.ExerciseCreateInput, 'user'>
  ): Promise<Exercise> {
    const exercise = await this.exercisesRepository.create({
      ...data,
      isCustom: true,
      user: { connect: { id: userId } },
    })

    try {
      await this.addExercise(userId, exercise.id)
    } catch (error) {
      await this.exercisesRepository.delete(exercise.id)
      throw error
    }

    return exercise
  }

  addExercise(userId: string, exerciseId: string): Promise<MyExercise> {
    if (
      this.items.some(
        (item) => item.userId === userId && item.exerciseId === exerciseId
      )
    ) {
      return Promise.reject(uniqueConstraintError())
    }

    const myExercise: MyExercise = {
      id: randomUUID(),
      createdAt: new Date(),
      userId,
      exerciseId,
    }
    this.items.push(myExercise)
    return Promise.resolve({ ...myExercise })
  }

  findByUserAndExercise(
    userId: string,
    exerciseId: string
  ): Promise<MyExercise | null> {
    const myExercise = this.items.find(
      (item) => item.userId === userId && item.exerciseId === exerciseId
    )
    return Promise.resolve(myExercise ? { ...myExercise } : null)
  }

  async findAllByUser(
    userId: string,
    query: string,
    category: Exercise['category'] | null,
    page: number
  ): Promise<(MyExercise & { exercise: Exercise })[]> {
    const matches: (MyExercise & { exercise: Exercise })[] = []

    for (const myExercise of this.items) {
      if (myExercise.userId !== userId) {
        continue
      }

      const exercise = await this.exercisesRepository.findById(
        myExercise.exerciseId
      )
      if (
        exercise &&
        (!query || exercise.name.toLowerCase().includes(query.toLowerCase())) &&
        (!category || exercise.category === category)
      ) {
        matches.push({
          ...myExercise,
          exercise,
        })
      }
    }

    return matches
      .sort((left, right) =>
        left.exercise.name.localeCompare(right.exercise.name)
      )
      .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  }

  findById(id: string): Promise<MyExercise | null> {
    const myExercise = this.items.find((item) => item.id === id)
    return Promise.resolve(myExercise ? { ...myExercise } : null)
  }

  deleteById(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id)
    if (index === -1) {
      return Promise.reject(new Error('Record to delete not found.'))
    }
    this.items.splice(index, 1)
    return Promise.resolve()
  }
}
