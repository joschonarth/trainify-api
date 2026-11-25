import { prisma } from '@/lib/prisma'
import { PrismaNotificationsRepository } from '../../repositories/prisma/prisma-notifications.repository'
import { MarkNotificationReadUseCase } from '../mark-notification-read.use-case'

export function makeMarkNotificationReadUseCase() {
  return new MarkNotificationReadUseCase(
    new PrismaNotificationsRepository(prisma)
  )
}
