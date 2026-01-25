import { createMiddleware } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'

export const databaseMiddleware = createMiddleware().server(async ({ next }) => {
  const { initDatabase } = await import('@repo/data-ops/database/setup')
  const { setAuth } = await import('@repo/data-ops/auth/server')

  // Initialize database if needed
  const db = initDatabase({
    host: env.DATABASE_HOST,
    username: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD,
  })

  // Also ensure auth is configured with this DB instance
  setAuth({
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    adapter: {
      drizzleDb: db,
      provider: 'pg',
    },
  })

  return next()
})
