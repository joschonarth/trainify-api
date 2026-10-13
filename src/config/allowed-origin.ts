export function getAllowedOrigin(nodeEnv = process.env.NODE_ENV) {
  return nodeEnv === 'production'
    ? 'https://trainify-web.vercel.app'
    : 'http://localhost:5173'
}
