import 'dotenv/config'

import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  JWT_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(1),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  const formattedError = z.treeifyError(_env.error)

  console.error('Invalid environment variables', formattedError)

  throw new Error('Invalid environment variables')
}

export const env = _env.data
