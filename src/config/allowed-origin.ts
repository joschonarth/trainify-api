import { env } from '@/env'

export const allowedOrigin =
  env.NODE_ENV === 'production'
    ? 'https://trainify-web.vercel.app'
    : 'http://localhost:5173'
