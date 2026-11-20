import type {
  StreakPlansRepository,
  TrackingPlan,
} from '../streak-plans.repository'

export class InMemoryStreakPlansRepository implements StreakPlansRepository {
  items = new Map<string, TrackingPlan>()

  findByUser(userId: string): Promise<TrackingPlan | null> {
    return Promise.resolve(structuredClone(this.items.get(userId) ?? null))
  }
}
