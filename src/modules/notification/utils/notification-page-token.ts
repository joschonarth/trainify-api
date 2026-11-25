import type { Notification } from 'generated/prisma'
import { AppError } from '@/shared/errors/app.error'
import { notificationPageTokenSchema } from '../schemas/notification.schema'

export function encodeNotificationPageToken({
  createdAt,
  id,
}: Pick<Notification, 'createdAt' | 'id'>) {
  const value = JSON.stringify({ createdAt: createdAt.toISOString(), id })
  return Buffer.from(value).toString('base64url')
}

export function decodeNotificationPageToken(token: string) {
  try {
    const value = Buffer.from(token, 'base64url')
    if (value.toString('base64url') !== token) {
      throw new Error('Noncanonical page token encoding')
    }
    const { createdAt, id } = notificationPageTokenSchema.parse(
      JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(value))
    )
    return { createdAt: new Date(createdAt), id }
  } catch {
    throw new AppError(400, 'Invalid notification cursor.')
  }
}
