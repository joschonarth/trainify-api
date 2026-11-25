import { z } from 'zod'

const notificationIdSchema = z.cuid()
export const listNotificationsQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe('Page size from 1 to 100.'),
  status: z.enum(['all', 'unread']).default('all'),
  cursor: z
    .base64url()
    .max(160)
    .optional()
    .describe('Cursor from the previous page.'),
})

export const notificationParamsSchema = z.object({
  notificationId: notificationIdSchema,
})

export const notificationPageTokenSchema = z.strictObject({
  createdAt: z.iso.datetime({ precision: 3 }),
  id: notificationIdSchema,
})

export const badgeNotificationDataSchema = z.object({
  badgeId: z.string().min(1),
  badgeName: z.string(),
  unlockedAt: z.iso.datetime(),
})

export const notificationSchema = z.object({
  id: notificationIdSchema,
  type: z.literal('BADGE_UNLOCKED'),
  data: badgeNotificationDataSchema,
  createdAt: z.iso.datetime(),
  readAt: z.iso.datetime().nullable(),
})

export const notificationPageSchema = z.object({
  items: z.array(notificationSchema),
  nextCursor: z.string().nullable(),
})

export type ListNotificationsQuery = z.infer<
  typeof listNotificationsQuerySchema
>
export type NotificationParams = z.infer<typeof notificationParamsSchema>

export const notificationErrorSchema = z.object({ message: z.string() })
export const notificationBadRequestSchema = notificationErrorSchema.extend({
  issues: z.unknown().optional(),
})
