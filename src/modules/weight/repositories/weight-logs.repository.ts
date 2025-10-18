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
  findManyByUserId(
    userId: string,
    filters?: { from?: Date; to?: Date },
  ): Promise<WeightLog[]>
  findByGoalId(goalId: string): Promise<WeightLog[]>
  findLatestByUserId(userId: string): Promise<WeightLog | null>
  findLatestByGoalId(goalId: string): Promise<WeightLog | null>
  findFirstByUserId(userId: string): Promise<WeightLog | null>
  findFirstByGoalId(goalId: string): Promise<WeightLog | null>
  findMinByUserId(userId: string): Promise<WeightLog | null>
  findMaxByUserId(userId: string): Promise<WeightLog | null>
  findAverageByUserId(userId: string): Promise<number | null>
  update(
    id: string,
    data: { goalId?: string | null; weight?: number; note?: string | null },
  ): Promise<WeightLog>
  delete(id: string): Promise<void>
}
