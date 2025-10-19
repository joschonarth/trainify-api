import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()

    if (!request.user?.userId) {
      return reply.status(401).send({ message: 'Unauthorized.' })
    }
  } catch {
    return reply.status(401).send({ message: 'Unauthorized.' })
  }
}
