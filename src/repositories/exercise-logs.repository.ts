import { ExerciseLog, Prisma } from '@prisma/client'

export interface ExerciseLogsRepository {
  create(data: Prisma.ExerciseLogCreateInput): Promise<ExerciseLog>
}
