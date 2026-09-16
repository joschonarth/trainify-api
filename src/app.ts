import fastifyCookie from '@fastify/cookie'
import cors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyJwt from '@fastify/jwt'
import fastifyRateLimit from '@fastify/rate-limit'
import fastify, { type FastifyError } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import z, { ZodError } from 'zod'
import { env } from './env'
import { registerSwagger } from './lib/swagger'
import { appRoutes } from './routes'

export const app = fastify({
  trustProxy: true,
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

app.setErrorHandler((error: FastifyError, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: z.treeifyError(error) })
  }

  if (error.statusCode === 429) {
    return reply.status(429).send({
      message: 'Too many requests. Please try again later.',
    })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  }

  return reply.status(500).send({ message: 'Internal server error.' })
})
