import { GoalType, WeightGoal } from '@prisma/client'

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
  create(data: CreateWeightGoalData): Promise<WeightGoal>
  findById(id: string): Promise<WeightGoal | null>
  findActiveGoalByUserId(userId: string): Promise<WeightGoal | null>
  deactivateGoal(id: string): Promise<void>
  findAllByUserId(
    userId: string,
    filters?: { status?: 'active' | 'completed' },
  ): Promise<WeightGoal[]>
  markAsAchieved(id: string, achievedAt: Date): Promise<void>
  updateProgress(id: string, progress: number): Promise<void>
}
