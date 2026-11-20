export interface WorkoutSessionCompletion {
  sessionId: string
  completedAt: Date
  hasActivity: boolean
  businessDate?: string | null
  timezone?: string | null
}

export interface WorkoutSessionCompletionsRepository {
  findBySessionId(sessionId: string): Promise<WorkoutSessionCompletion | null>
  create(data: WorkoutSessionCompletion): Promise<WorkoutSessionCompletion>
}
