import { z } from 'zod'

const milliseconds = (fallback: number) =>
  z.coerce.number().int().min(1).max(2_147_483_647).default(fallback)

export const outboxWorkerConfigSchema = z
  .object({
    DATABASE_URL: z.url({ protocol: /^postgres(?:ql)?$/ }),
    RABBITMQ_URL: z.url({ protocol: /^amqps?$/ }),
    OUTBOX_HEALTH_PORT: z.coerce
      .number()
      .int()
      .min(1)
      .max(65_535)
      .default(3334),
    OUTBOX_BATCH_SIZE: z.coerce.number().int().min(1).max(100).default(20),
    OUTBOX_POLL_MS: milliseconds(1000),
    OUTBOX_CONFIRM_TIMEOUT_MS: milliseconds(5000),
    OUTBOX_LEASE_MS: milliseconds(30_000),
    OUTBOX_MAX_RETRY_MS: milliseconds(60_000),
    OUTBOX_SHUTDOWN_MS: milliseconds(15_000),
    OUTBOX_BACKLOG_WARN_MS: milliseconds(300_000),
  })
  .refine(
    (config) => config.OUTBOX_LEASE_MS > config.OUTBOX_CONFIRM_TIMEOUT_MS,
    { path: ['OUTBOX_LEASE_MS'], message: 'Lease must exceed confirm timeout' }
  )
