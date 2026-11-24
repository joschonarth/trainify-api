import type { ConfirmChannel } from 'amqplib'
import { WORKOUT_FINALIZED_V1 } from '@/modules/session/events/workout-finalized-v1'

export const SESSION_EVENTS_EXCHANGE = 'trainify.events'
export const WORKOUT_FINALIZED_QUEUE =
  'trainify.gamification.workout-finalized.v1'
export const WORKOUT_FINALIZED_DLQ = `${WORKOUT_FINALIZED_QUEUE}.dlq`

export async function declareWorkoutFinalizedTopology(channel: ConfirmChannel) {
  await channel.assertExchange(SESSION_EVENTS_EXCHANGE, 'topic', {
    durable: true,
  })
  await channel.assertQueue(WORKOUT_FINALIZED_QUEUE, {
    durable: true,
    arguments: { 'x-queue-type': 'quorum', 'x-delivery-limit': -1 },
  })
  await channel.bindQueue(
    WORKOUT_FINALIZED_QUEUE,
    SESSION_EVENTS_EXCHANGE,
    WORKOUT_FINALIZED_V1
  )
}

export async function declareWorkoutFinalizedConsumerTopology(
  channel: ConfirmChannel
) {
  await declareWorkoutFinalizedTopology(channel)
  await channel.assertQueue(WORKOUT_FINALIZED_DLQ, {
    durable: true,
    arguments: { 'x-queue-type': 'quorum' },
  })
}
