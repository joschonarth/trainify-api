import { ExerciseLog, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { ExerciseLogsRepository } from '../exercise-logs.repository'

export class PrismaExerciseLogsRepository implements ExerciseLogsRepository {
  async create(data: Prisma.ExerciseLogCreateInput): Promise<ExerciseLog> {
    return prisma.exerciseLog.create({ data })
  }
}
