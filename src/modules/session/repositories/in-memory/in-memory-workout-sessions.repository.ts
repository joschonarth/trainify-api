import { randomUUID } from 'node:crypto'
import type {
  DailyWorkoutSession,
  Prisma,
  WorkoutSession,
} from 'generated/prisma'
import type {
  DailySessionRequest,
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '../workout-sessions.repository'

export class InMemoryWorkoutSessionsRepository
  implements Pick<WorkoutSessionsRepository, 'findById' | 'resolveDailySession'>
{
  items: WorkoutSession[] = []
  details = new Map<string, WorkoutSessionWithWorkout>()
  dailyIdentities: DailyWorkoutSession[] = []
  private queue: Promise<unknown> = Promise.resolve()

  findById(id: string) {
    return Promise.resolve(this.items.find((item) => item.id === id) ?? null)
  }

  resolveDailySession(
    request: DailySessionRequest,
    create?: Prisma.WorkoutSessionUncheckedCreateInput
  ): Promise<WorkoutSessionWithWorkout | null> {
    const result = this.queue.then(() => this.resolveDaily(request, create))
    this.queue = result.catch(() => undefined)
    return result
  }

  findManyByWorkoutAndUser(userId: string, workoutId: string) {
    return Promise.resolve(
      [...this.details.values()].filter(
        (session) =>
          session.userId === userId && session.workoutId === workoutId
      )
    )
  }

  findDetailedByUserAndDateRange(userId: string, start: Date, end: Date) {
    return Promise.resolve(
      [...this.details.values()].filter(
        (session) =>
          session.userId === userId &&
          session.date >= start &&
          session.date <= end
      )
    )
  }

  private resolveDaily(
    request: DailySessionRequest,
    create?: Prisma.WorkoutSessionUncheckedCreateInput
  ): WorkoutSessionWithWorkout | null {
    const identity = this.dailyIdentities.find(
      (item) =>
        item.userId === request.userId &&
        item.businessDate === request.businessDate
    )
    if (identity) {
      return this.details.get(identity.sessionId) ?? null
    }
    const legacy = this.items
      .filter(
        (item) =>
          item.userId === request.userId &&
          item.date >= request.start &&
          item.date <= request.end &&
          !this.dailyIdentities.some((key) => key.sessionId === item.id)
      )
      .sort(
        (a, b) =>
          a.date.getTime() - b.date.getTime() || a.id.localeCompare(b.id)
      )[0]
    let session = legacy ? this.details.get(legacy.id) : undefined
    if (!session && create) {
      const rawExercises = create.exerciseSessions?.create
      const exerciseItems = rawExercises ?? []
      const exercises = Array.isArray(exerciseItems)
        ? exerciseItems
        : [exerciseItems]
      session = {
        id: randomUUID(),
        userId: request.userId,
        workoutId: create.workoutId,
        date: create.date ? new Date(create.date) : new Date(),
        status: 'PENDING',
        startedAt: null,
        endedAt: null,
        duration: null,
        workout: { id: create.workoutId, name: 'Workout', exercises: [] },
        exerciseSessions: exercises.map((exercise) => ({
          id: randomUUID(),
          plannedSets: exercise.plannedSets ?? null,
          plannedReps: exercise.plannedReps ?? null,
          plannedWeight: exercise.plannedWeight ?? null,
          completed: false,
          skipReason: null,
          state: 'PENDING',
          startedAt: null,
          endedAt: null,
          duration: null,
          exercise: {
            id:
              ('exerciseId' in exercise
                ? exercise.exerciseId
                : exercise.exercise.connect?.id) ?? '',
            name: 'Exercise',
            category: null,
            type: null,
            measurement: 'REPS',
          },
          logs: [],
        })),
      }
      this.items.push(session)
      this.details.set(session.id, session)
    }
    if (!session) {
      return null
    }
    this.dailyIdentities.push({
      userId: request.userId,
      businessDate: request.businessDate,
      timezone: request.timezone,
      sessionId: session.id,
    })
    return session
  }
}
