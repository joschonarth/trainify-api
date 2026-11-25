import { prisma } from '@/lib/prisma'
import { PrismaNotificationsRepository } from '../../repositories/prisma/prisma-notifications.repository'
import { ListNotificationsUseCase } from '../list-notifications.use-case'

export function makeListNotificationsUseCase() {
  return new ListNotificationsUseCase(new PrismaNotificationsRepository(prisma))
}
