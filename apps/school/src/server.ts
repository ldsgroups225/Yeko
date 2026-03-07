import type { LogsQueue } from '@repo/background-tasks'
import { setExecutionContext, setQueueBinding, withTaskScope } from '@repo/background-tasks'
import { setAuth, withAuthScope } from '@repo/data-ops/auth/server'
import { initDatabase, withDatabaseScope } from '@repo/data-ops/database/setup'
import handler from '@tanstack/react-start/server-entry'

console.warn('[server-entry]: using custom server entry in \'src/server.ts\'')

// Extended Env interface with queue binding (LOGS_QUEUE is optional in workers that don't have queue binding)
interface ExtendedEnv extends Omit<Env, 'LOGS_QUEUE'> {
  LOGS_QUEUE?: LogsQueue
}

export default {
  fetch(request: Request, workerEnv: ExtendedEnv, ctx: ExecutionContext) {
    // Wrap entire request in AsyncLocalStorage scopes to prevent cross-request I/O leaks
    return withDatabaseScope(() =>
      withAuthScope(() =>
        withTaskScope(() => {
          // Initialize database on each request
          const db = initDatabase({
            host: workerEnv.DATABASE_HOST,
            username: workerEnv.DATABASE_USERNAME,
            password: workerEnv.DATABASE_PASSWORD,
          })

          // Initialize auth with database and config
          setAuth({
            adapter: {
              drizzleDb: db,
              provider: 'pg',
            },
            secret: workerEnv.BETTER_AUTH_SECRET,
            baseURL: workerEnv.BETTER_AUTH_BASE_URL,
            cookiePrefix: 'school',
            trustedOrigins: [workerEnv.BETTER_AUTH_BASE_URL, 'http://localhost:3001'],
            socialProviders: {
              google: {
                clientId: workerEnv.GOOGLE_CLIENT_ID,
                clientSecret: workerEnv.GOOGLE_CLIENT_SECRET,
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
        }),
      ),
    )
  },
}
