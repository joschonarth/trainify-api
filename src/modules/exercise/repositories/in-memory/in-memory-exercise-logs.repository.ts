import { randomUUID } from 'node:crypto'
import type { Exercise, ExerciseLog, Prisma } from 'generated/prisma'
import type { ExerciseLogsRepository } from '../exercise-logs.repository'
import type { ExercisesRepository } from '../exercises.repository'

function unwrap<T>(value: unknown, current: T): T {
  if (value === undefined) {
    return current
  }
  if (
    value !== null &&
    typeof value === 'object' &&
    !(value instanceof Date) &&
    'set' in value
  ) {
    const set = (value as { set?: T }).set
    return set === undefined ? current : set
  }
  if (
    value !== null &&
    typeof value === 'object' &&
    'increment' in value &&
    typeof current === 'number'
  ) {
    const increment = (value as { increment?: number }).increment
    return increment === undefined ? current : ((current + increment) as T)
  }
  return value as T
}

function connectedId(value: unknown): string {
  if (value === null || typeof value !== 'object' || !('connect' in value)) {
    throw new Error('A connected relation is required.')
  }

  const connect = value.connect
  if (connect === null || typeof connect !== 'object' || !('id' in connect)) {
    throw new Error('A relation connected by ID is required.')
  }

  const id = connect.id
  if (typeof id !== 'string') {
    throw new Error('A relation connected by ID is required.')
  }
  return id
}

function uniqueConstraintError(): Error & { code: 'P2002' } {
  return Object.assign(
    new Error('Unique constraint failed on the field: (`id`)'),
    { code: 'P2002' as const }
  )
}

function copyLog(log: ExerciseLog): ExerciseLog {
  return { ...log, date: new Date(log.date) }
}

type ExerciseLogWithExercise = ExerciseLog & {
  exercise: {
    id: string
    name: string
    category: Exercise['category'] | null
    type: Exercise['type'] | null
  }
}

export class InMemoryExerciseLogsRepository implements ExerciseLogsRepository {
  items: ExerciseLog[] = []

  constructor(private readonly exercisesRepository: ExercisesRepository) {}

  create(data: Prisma.ExerciseLogCreateInput): Promise<ExerciseLog> {
    const id = data.id ?? randomUUID()
    if (this.items.some((item) => item.id === id)) {
      return Promise.reject(uniqueConstraintError())
    }

    const log: ExerciseLog = {
      id,
      sets: data.sets,
      reps: data.reps,
      weight: data.weight ?? null,
      volume: data.volume ?? null,
      description: data.description ?? null,
      date: data.date ? new Date(data.date) : new Date(),
      exerciseSessionId: connectedId(data.exerciseSession),
      userId: connectedId(data.user),
      exerciseId: connectedId(data.exercise),
    }
    this.items.push(log)
    return Promise.resolve(copyLog(log))
  }

  update(
    id: string,
    data: Prisma.ExerciseLogUpdateInput
  ): Promise<ExerciseLog> {
    const index = this.items.findIndex((item) => item.id === id)
    const current = this.items[index]
    if (!current) {
      return Promise.reject(new Error('Record to update not found.'))
    }

    const updated: ExerciseLog = {
      ...current,
      sets: unwrap(data.sets, current.sets),
      reps: unwrap(data.reps, current.reps),
      weight: unwrap(data.weight, current.weight),
      volume: unwrap(data.volume, current.volume),
      description: unwrap(data.description, current.description),
      date: new Date(unwrap<Date | string>(data.date, current.date)),
      ...(data.exerciseSession?.connect?.id && {
        exerciseSessionId: data.exerciseSession.connect.id,
      }),
      ...(data.user?.connect?.id && { userId: data.user.connect.id }),
      ...(data.exercise?.connect?.id && {
        exerciseId: data.exercise.connect.id,
      }),
    }
    this.items[index] = updated
    return Promise.resolve(copyLog(updated))
  }

  async findAllByUser(userId: string): Promise<ExerciseLogWithExercise[]> {
    return await this.withExercise(
      this.items
        .filter((item) => item.userId === userId)
        .sort((left, right) => right.date.getTime() - left.date.getTime())
    )
  }

  findByUserAndExerciseBetweenDates(
    userId: string,
    exerciseId: string,
    start: Date,
    end: Date
  ): Promise<ExerciseLog | null> {
    const log = this.items.find(
      (item) =>
        item.userId === userId &&
        item.exerciseId === exerciseId &&
        item.date >= start &&
        item.date <= end
    )
    return Promise.resolve(log ? copyLog(log) : null)
  }

  async findById(id: string): Promise<ExerciseLogWithExercise | null> {
    const log = this.items.find((item) => item.id === id)
    if (!log) {
      return null
    }
    const [withExercise] = await this.withExercise([log])
    return withExercise ?? null
  }

  findByExerciseSession(
    exerciseSessionId: string
  ): Promise<ExerciseLog | null> {
    const log = this.items.find(
      (item) => item.exerciseSessionId === exerciseSessionId
    )
    return Promise.resolve(log ? copyLog(log) : null)
  }

  async findManyByExerciseAndUser(
    userId: string,
    exerciseId: string
  ): Promise<ExerciseLogWithExercise[]> {
    return await this.withExercise(
      this.items
        .filter(
          (item) => item.userId === userId && item.exerciseId === exerciseId
        )
        .sort((left, right) => left.date.getTime() - right.date.getTime())
    )
  }

  findMaxVolumeByExerciseAndUser(
    userId: string,
    exerciseId: string
  ): Promise<{ maxVolume: number; date: Date } | null> {
    const logs = this.items.filter(
      (item) => item.userId === userId && item.exerciseId === exerciseId
    )
    if (logs.length === 0) {
      return Promise.resolve(null)
    }

    const maxLog = logs.reduce((max, log) =>
      (log.volume ?? 0) > (max.volume ?? 0) ? log : max
    )
    return Promise.resolve({
      maxVolume: maxLog.volume ?? 0,
      date: new Date(maxLog.date),
    })
  }

  private async withExercise(
    logs: ExerciseLog[]
  ): Promise<ExerciseLogWithExercise[]> {
    const result: ExerciseLogWithExercise[] = []
    for (const log of logs) {
      const exercise = await this.exercisesRepository.findById(log.exerciseId)
      if (exercise) {
        result.push({
          ...copyLog(log),
          exercise: {
            id: exercise.id,
            name: exercise.name,
            category: exercise.category,
            type: exercise.type,
          },
        })
      }
    }
    return result
  }
}
