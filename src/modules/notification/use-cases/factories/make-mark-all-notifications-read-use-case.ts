import { prisma } from '@/lib/prisma'
import { PrismaNotificationsRepository } from '../../repositories/prisma/prisma-notifications.repository'
import { MarkAllNotificationsReadUseCase } from '../mark-all-notifications-read.use-case'

export function makeMarkAllNotificationsReadUseCase() {
  return new MarkAllNotificationsReadUseCase(
    new PrismaNotificationsRepository(prisma)
  )
}
