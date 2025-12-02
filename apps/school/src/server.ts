import { initDatabase } from '@repo/data-ops/database/setup'
import { setAuth } from '@repo/data-ops/auth/server'
import handler from '@tanstack/react-start/server-entry'
import { env } from 'cloudflare:workers'

console.warn('[server-entry]: using custom server entry in \'src/server.ts\'')

export default {
  fetch(request: Request) {
    // Initialize database on each request
    const db = initDatabase({
      host: env.DATABASE_HOST,
      username: env.DATABASE_USERNAME,
      password: env.DATABASE_PASSWORD,
    })

    // Initialize auth with database and config
    setAuth({
      adapter: {
        drizzleDb: db,
        provider: 'pg',
      },
      secret: env.BETTER_AUTH_SECRET,
      baseURL: env.BETTER_AUTH_URL,
      socialProviders: {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      },
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
      },
    })

    return handler.fetch(request)
  },
}
