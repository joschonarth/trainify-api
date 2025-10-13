import { WeightLog } from '@prisma/client'

export interface CreateWeightLogData {
  userId: string
  goalId?: string | null
  weight: number
  note?: string | null
}

export interface WeightLogsRepository {
  create(data: CreateWeightLogData): Promise<WeightLog>
  findById(id: string): Promise<WeightLog | null>
  findByUserId(userId: string): Promise<WeightLog[]>
  findLatestByUserId(userId: string): Promise<WeightLog | null>
  findLatestByGoalId(goalId: string): Promise<WeightLog | null>
  delete(id: string): Promise<void>
}
