import { GoalType, WeightGoal, WeightLog } from '@prisma/client'

export interface CreateWeightGoalData {
  userId: string
  name: string
  description?: string | null
  goalType: GoalType
  startWeight?: number | null
  targetWeight: number
  startDate?: Date
  endDate?: Date | null
}

export interface WeightGoalsRepository {
  findById(id: string): Promise<(WeightGoal & { logs: WeightLog[] }) | null>
  findAllByUserId(
    userId: string,
    filters?: { status?: 'active' | 'completed' },
  ): Promise<WeightGoal[]>
  findActiveGoalByUserId(userId: string): Promise<WeightGoal | null>
  create(data: CreateWeightGoalData): Promise<WeightGoal>
  deactivateGoal(id: string): Promise<void>
  deactivateAllByUserId(userId: string): Promise<void>
  markAsAchieved(id: string, achievedAt: Date): Promise<void>
  update(
    id: string,
    data: {
      name?: string
      description?: string | null
      endDate?: Date | null
      startWeight?: number | null
    },
  ): Promise<WeightGoal>
  updateProgress(id: string, progress: number): Promise<void>
  delete(id: string): Promise<void>
}
