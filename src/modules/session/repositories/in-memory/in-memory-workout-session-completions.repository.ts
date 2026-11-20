import type {
  WorkoutSessionCompletion,
  WorkoutSessionCompletionsRepository,
} from '../workout-session-completions.repository'

export class InMemoryWorkoutSessionCompletionsRepository
  implements WorkoutSessionCompletionsRepository
{
  items: WorkoutSessionCompletion[] = []

  findBySessionId(sessionId: string) {
    return Promise.resolve(
      this.items.find((item) => item.sessionId === sessionId) ?? null
    )
  }

  create(data: WorkoutSessionCompletion) {
    this.items.push(structuredClone(data))
    return Promise.resolve(structuredClone(data))
  }
}
