// DO NOT DELETE THIS FILE!!!
// This file is a good smoke test to make sure the custom server entry is working
import { setAuth, withAuthScope } from '@repo/data-ops/auth/server'
import { initDatabase, withDatabaseScope } from '@repo/data-ops/database/setup'
import handler from '@tanstack/react-start/server-entry'
import { env } from 'cloudflare:workers'

console.warn('[server-entry]: using custom server entry in \'src/server.ts\'')

export default {
  fetch(request: Request) {
    // Wrap entire request in AsyncLocalStorage scopes to prevent cross-request I/O leaks
    return withDatabaseScope(() =>
      withAuthScope(() => {
        // Initialize database on each request
        const db = initDatabase({
          host: env.DATABASE_HOST,
          username: env.DATABASE_USERNAME,
          password: env.DATABASE_PASSWORD,
        })

        setAuth({
          secret: env.BETTER_AUTH_SECRET,
          baseURL: env.BETTER_AUTH_BASE_URL,
          cookiePrefix: 'teacher',
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
        return handler.fetch(request, {
          context: {
            fromFetch: true,
          },
        })
      }),
    )
  },
}
