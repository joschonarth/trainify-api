import { GoalType, WeightGoal, WeightLog } from '@prisma/client'

export interface CreateWeightGoalData {
  userId: string
  name: string
  description?: string | null
  goalType: GoalType
  startWeight: number
  targetWeight: number
  startDate?: Date
  endDate?: Date | null
}

export interface WeightGoalsRepository {
  // findById(id: string): Promise<WeightGoal | null>
  findById(id: string): Promise<(WeightGoal & { logs: WeightLog[] }) | null>
  findAllByUserId(
    userId: string,
    filters?: { status?: 'active' | 'completed' },
  ): Promise<WeightGoal[]>
  create(data: CreateWeightGoalData): Promise<WeightGoal>
  deactivateGoal(id: string): Promise<void>
  markAsAchieved(id: string, achievedAt: Date): Promise<void>
  updateProgress(id: string, progress: number): Promise<void>
}
