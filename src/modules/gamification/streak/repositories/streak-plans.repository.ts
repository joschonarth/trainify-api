export interface TrackingPlan {
  timezone: string
  activationDate: string
  versions: { effectiveDate: string; workouts: Record<string, string> }[]
}

export interface StreakPlansRepository {
  findByUser(userId: string): Promise<TrackingPlan | null>
}
