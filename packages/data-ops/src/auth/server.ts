import type { getDb } from '../database/setup'
import { AsyncLocalStorage } from 'node:async_hooks'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import {
  auth_account,
  auth_session,
  auth_user,
  auth_verification,
} from '../drizzle/auth-schema'
import { createBetterAuth } from './setup'

type BetterAuthInstance = ReturnType<typeof createBetterAuth>

// Request-scoped storage to prevent cross-request I/O leaks in Cloudflare Workers
const requestAuth = new AsyncLocalStorage<{ current: BetterAuthInstance | undefined }>()

// Global fallback for non-ALS environments (tests, local dev)
let globalAuth: BetterAuthInstance | undefined

/**
 * Create a request-scoped auth context.
 * Must wrap the entire request lifecycle in CF Workers.
 */
export function withAuthScope<T>(fn: () => T): T {
  return requestAuth.run({ current: undefined }, fn)
}

export function setAuth(
  config: Omit<Parameters<typeof createBetterAuth>[0], 'database'> & {
    adapter: {
      drizzleDb: ReturnType<typeof getDb>
      provider: Parameters<typeof drizzleAdapter>[1]['provider']
    }
  },
) {
  const instance = createBetterAuth({
    database: drizzleAdapter(config.adapter.drizzleDb, {
      provider: config.adapter.provider,
      schema: {
        auth_user,
        auth_account,
        auth_session,
        auth_verification,
      },
    }),
    ...config,
  })

  // Store in request-scoped ALS if available
  const store = requestAuth.getStore()
  if (store) {
    store.current = instance
  }

  // Also set global for backward compatibility
  globalAuth = instance

  return instance
}

export function getAuth() {
  // Prefer request-scoped instance to avoid cross-request I/O leaks
  const store = requestAuth.getStore()
  if (store?.current) {
    return store.current
  }
  // Fallback to global for non-ALS environments
  if (globalAuth) {
    return globalAuth
  }
  throw new Error('Auth not initialized')
}
