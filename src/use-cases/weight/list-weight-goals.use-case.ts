import { WeightGoal } from '@prisma/client'

import { WeightGoalsRepository } from '@/repositories/weight-goals.repository'
import { WeightLogsRepository } from '@/repositories/weight-logs.repository'
import { calculateWeightGoalProgress } from '@/utils/calculate-weight-goal-progress'

interface ListWeightGoalsUseCaseRequest {
  userId: string
}

interface WeightGoalWithProgress extends WeightGoal {
  progress: number
}

interface ListWeightGoalsUseCaseResponse {
  weightGoals: WeightGoalWithProgress[]
}

export class ListWeightGoalsUseCase {
  constructor(
    private weightGoalsRepository: WeightGoalsRepository,
    private weightLogsRepository: WeightLogsRepository,
  ) {}

  async execute({
    userId,
  }: ListWeightGoalsUseCaseRequest): Promise<ListWeightGoalsUseCaseResponse> {
    const goals = await this.weightGoalsRepository.findAllByUserId(userId)
    const latestLog = await this.weightLogsRepository.findLatestByUserId(userId)

    const weightGoals = goals.map((goal) => {
      const currentWeight = latestLog ? latestLog.weight : goal.startWeight
      const progress = calculateWeightGoalProgress(goal, currentWeight)
      return { ...goal, progress }
    })

    return { weightGoals }
  }
}
