import { randomUUID } from 'node:crypto'
import type { WeightGoal } from 'generated/prisma'

import type {
  CreateWeightGoalData,
  WeightGoalsRepository,
} from '../weight-goals.repository'

export class InMemoryWeightGoalsRepository implements WeightGoalsRepository {
  items: WeightGoal[] = []

  findById(id: string): Promise<WeightGoal | null> {
    return Promise.resolve(this.items.find((goal) => goal.id === id) ?? null)
  }

  findAllByUserId(
    userId: string,
    filters?: { status?: 'active' | 'completed' }
  ): Promise<WeightGoal[]> {
    return Promise.resolve(
      this.items.filter(
        (goal) =>
          goal.userId === userId &&
          (!filters?.status ||
            (filters.status === 'active'
              ? goal.isActive
              : Boolean(goal.achievedAt)))
      )
    )
  }

  findActiveGoalByUserId(userId: string): Promise<WeightGoal | null> {
    return Promise.resolve(
      this.items.find((goal) => goal.userId === userId && goal.isActive) ?? null
    )
  }

  create(data: CreateWeightGoalData): Promise<WeightGoal> {
    const now = new Date()
    const goal: WeightGoal = {
      id: randomUUID(),
      userId: data.userId,
      name: data.name,
      description: data.description ?? null,
      goalType: data.goalType,
      startWeight: data.startWeight ?? null,
      targetWeight: data.targetWeight,
      startDate: data.startDate ?? now,
      endDate: data.endDate ?? null,
      achievedAt: null,
      isActive: true,
      progress: 0,
      createdAt: now,
      updatedAt: now,
    }
    this.items.push(goal)
    return Promise.resolve(goal)
  }

  deactivateGoal(id: string): Promise<void> {
    const goal = this.items.find((item) => item.id === id)
    if (goal) {
      goal.isActive = false
    }
    return Promise.resolve()
  }

  deactivateAllByUserId(userId: string): Promise<void> {
    for (const goal of this.items) {
      if (goal.userId === userId && goal.isActive) {
        goal.isActive = false
      }
    }
    return Promise.resolve()
  }

  markAsAchieved(id: string, achievedAt: Date): Promise<void> {
    const goal = this.items.find((item) => item.id === id)
    if (goal) {
      goal.achievedAt = achievedAt
      goal.isActive = false
    }
    return Promise.resolve()
  }

  update(
    id: string,
    data: {
      name?: string
      description?: string | null
      endDate?: Date | null
      startWeight?: number | null
    }
  ): Promise<WeightGoal> {
    const goal = this.items.find((item) => item.id === id)
    if (!goal) {
      return Promise.reject(new Error('Goal not found'))
    }
    Object.assign(goal, data)
    return Promise.resolve(goal)
  }

  updateProgress(id: string, progress: number): Promise<void> {
    const goal = this.items.find((item) => item.id === id)
    if (goal) {
      goal.progress = progress
    }
    return Promise.resolve()
  }

  delete(id: string): Promise<void> {
    this.items = this.items.filter((goal) => goal.id !== id)
    return Promise.resolve()
  }
}
