export interface WorkoutSessionCompletion {
  sessionId: string
  completedAt: Date
  hasActivity: boolean
}

export interface WorkoutSessionCompletionsRepository {
  findBySessionId(sessionId: string): Promise<WorkoutSessionCompletion | null>
  create(data: WorkoutSessionCompletion): Promise<WorkoutSessionCompletion>
}
