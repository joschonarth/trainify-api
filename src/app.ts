import fastifyCookie from '@fastify/cookie'
import cors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyJwt from '@fastify/jwt'
import fastifyRateLimit from '@fastify/rate-limit'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { errorHandler } from './config/error-handler'
import { loggerOptions } from './config/logger'
import { env } from './env'
import { registerSwagger } from './lib/swagger'
import { appRoutes } from './routes'

export const app = fastify({
  trustProxy: true,
  logger: loggerOptions,
}).withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(cors, {
  origin:
    env.NODE_ENV === 'production'
      ? 'https://trainify-web.vercel.app'
      : 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})

app.register(fastifyHelmet, { contentSecurityPolicy: false })

app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
})

app.register(fastifyCookie, {
  parseOptions: {
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production',
  },
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'token',
    signed: false,
  },
})

registerSwagger(app)

app.register(appRoutes)

app.setNotFoundHandler((_, reply) => {
  return reply.status(404).send({ message: 'Route not found.' })
})

app.setErrorHandler(errorHandler)
