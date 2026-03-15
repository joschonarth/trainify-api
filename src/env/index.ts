import 'dotenv/config'

import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  JWT_SECRET: z.string(),
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
