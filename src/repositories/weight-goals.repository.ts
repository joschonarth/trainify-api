import { GoalType, WeightGoal } from '@prisma/client'

export interface CreateWeightGoalData {
  userId: string
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
  findAllByUserId(userId: string): Promise<WeightGoal[]>
}
