import type { ConfirmChannel } from 'amqplib'
import { BADGE_UNLOCKED_V1 } from '@/modules/gamification/badge/events/badge-unlocked-v1'
import { SESSION_EVENTS_EXCHANGE } from './workout-finalized-topology'

export const BADGE_UNLOCKED_QUEUE = 'trainify.notifications.badge-unlocked.v1'
export const BADGE_UNLOCKED_DLQ = `${BADGE_UNLOCKED_QUEUE}.dlq`

export async function declareBadgeUnlockedTopology(channel: ConfirmChannel) {
  await channel.assertExchange(SESSION_EVENTS_EXCHANGE, 'topic', {
    durable: true,
  })
  await channel.assertQueue(BADGE_UNLOCKED_QUEUE, {
    durable: true,
    arguments: { 'x-queue-type': 'quorum', 'x-delivery-limit': -1 },
  })
  await channel.bindQueue(
    BADGE_UNLOCKED_QUEUE,
    SESSION_EVENTS_EXCHANGE,
    BADGE_UNLOCKED_V1
  )
  await channel.assertQueue(BADGE_UNLOCKED_DLQ, {
    durable: true,
    arguments: { 'x-queue-type': 'quorum' },
  })
}
