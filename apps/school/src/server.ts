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

    // Set execution context for waitUntil (background tasks)
    setExecutionContext(ctx)

    // Set queue binding for background logging (if available)
    if (workerEnv.LOGS_QUEUE) {
      setQueueBinding(workerEnv.LOGS_QUEUE)
    }

    return handler.fetch(request)
  },
}
