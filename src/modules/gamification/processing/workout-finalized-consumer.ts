import { RabbitMqEventConsumer } from '@/infra/rabbitmq/rabbitmq-event-consumer'
import {
  WORKOUT_FINALIZED_DLQ,
  WORKOUT_FINALIZED_QUEUE,
} from '@/infra/rabbitmq/workout-finalized-topology'
import {
  type WorkoutFinalizedV1,
  workoutFinalizedV1Schema,
} from '@/modules/session/events/workout-finalized-v1'

export class WorkoutFinalizedConsumer extends RabbitMqEventConsumer<WorkoutFinalizedV1> {
  constructor(
    broker: ConstructorParameters<
      typeof RabbitMqEventConsumer<WorkoutFinalizedV1>
    >[0],
    handler: ConstructorParameters<
      typeof RabbitMqEventConsumer<WorkoutFinalizedV1>
    >[1],
    log: ConstructorParameters<
      typeof RabbitMqEventConsumer<WorkoutFinalizedV1>
    >[2],
    config: { prefetch: number; pollMs: number }
  ) {
    super(broker, handler, log, {
      ...config,
      queue: WORKOUT_FINALIZED_QUEUE,
      dlq: WORKOUT_FINALIZED_DLQ,
      schema: workoutFinalizedV1Schema,
    })
  }
}
