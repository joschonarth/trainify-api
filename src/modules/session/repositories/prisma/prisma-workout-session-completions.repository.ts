import type { Prisma } from 'generated/prisma'
import type {
  WorkoutSessionCompletion,
  WorkoutSessionCompletionsRepository,
} from '../workout-session-completions.repository'

export class PrismaWorkoutSessionCompletionsRepository
  implements WorkoutSessionCompletionsRepository
{
  constructor(private readonly client: Prisma.TransactionClient) {}

  async findBySessionId(sessionId: string) {
    return await this.client.workoutSessionCompletion.findUnique({
      where: { sessionId },
    })
  }

  async create(data: WorkoutSessionCompletion) {
    return await this.client.workoutSessionCompletion.create({ data })
  }
}
