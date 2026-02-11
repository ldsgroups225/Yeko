import type { LogsQueue } from '@repo/background-tasks'
import { setExecutionContext, setQueueBinding } from '@repo/background-tasks'
import { setAuth } from '@repo/data-ops/auth/server'
import { initDatabase } from '@repo/data-ops/database/setup'
import handler from '@tanstack/react-start/server-entry'
import { env } from 'cloudflare:workers'

console.warn('[server-entry]: using custom server entry in \'src/server.ts\'')

// Extended Env interface with queue binding (LOGS_QUEUE is optional in workers that don't have queue binding)
interface ExtendedEnv extends Omit<Env, 'LOGS_QUEUE'> {
  LOGS_QUEUE?: LogsQueue
}

export default {
  fetch(request: Request, workerEnv: ExtendedEnv, ctx: ExecutionContext) {
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
      baseURL: env.BETTER_AUTH_BASE_URL,
      cookiePrefix: 'school',
      trustedOrigins: [env.BETTER_AUTH_BASE_URL, 'http://localhost:3001'],
      socialProviders: {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      },
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        sendResetPassword: async ({ user, url, token }) => {
          // TODO: Integrate with email service (e.g., Resend, SendGrid)
          // For now, log the reset URL for development
          console.warn(`[Password Reset] User: ${user.email}, Reset URL: ${url}, Token: ${token}`)
          // Return void - the function must complete successfully for the endpoint to work
        },
      },
    })

    // Set execution context for waitUntil (background tasks)
    setExecutionContext(ctx)

    // Set queue binding for background logging (if available)
    if (workerEnv.LOGS_QUEUE) {
      setQueueBinding(workerEnv.LOGS_QUEUE)
    }

    return handler.fetch(request)
  },
}
