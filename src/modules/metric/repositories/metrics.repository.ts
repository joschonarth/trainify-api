export interface UserMetrics {
  totalWorkouts: number
  totalExercises: number
  totalWorkoutDuration: number
}

export interface MetricsRepository {
  getUserMetrics(userId: string): Promise<UserMetrics>
}
