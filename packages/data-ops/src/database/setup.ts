// packages/data-ops/src/database/setup.ts

import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { AsyncLocalStorage } from 'node:async_hooks'
import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeonHttp } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as authSchema from '../drizzle/auth-schema'
import * as coreSchema from '../drizzle/core-schema'
import * as schoolSchema from '../drizzle/school-schema'
import * as supportSchema from '../drizzle/support-schema'

// Combined schema type
const schema = { ...authSchema, ...coreSchema, ...schoolSchema, ...supportSchema }
type Schema = typeof schema

// Database types for each driver
type NeonDatabase = NeonHttpDatabase<Schema>
type NodeDatabase = NodePgDatabase<Schema>

// Union type for the database instance
type Database = NeonDatabase | NodeDatabase

// Request-scoped storage to prevent cross-request I/O leaks in Cloudflare Workers
const requestDb = new AsyncLocalStorage<{ current: Database | undefined }>()

// Global fallback for non-ALS environments (tests, seed scripts, local dev with pg)
let globalDb: Database | undefined

/**
 * Create a request-scoped database context.
 * Must wrap the entire request lifecycle in CF Workers.
 */
export function withDatabaseScope<T>(fn: () => T): T {
  return requestDb.run({ current: undefined }, fn)
}

export function initDatabase(connection: {
  host: string
  username: string
  password: string
}): Database {
  const connectionString = `postgres://${connection.username}:${connection.password}@${connection.host}`

  let database: Database

  // Check if it's a Neon connection (contains .neon.tech or sslmode=require)
  if (connection.host.includes('.neon.tech') || connection.host.includes('sslmode=')) {
    // Use Neon HTTP driver for Cloudflare Workers - stateless, creates fresh per request
    const sql = neon(connectionString)
    database = drizzleNeonHttp({ client: sql, schema })
  }
  else {
    // Use standard PostgreSQL connection (cached for non-serverless)
    if (globalDb) {
      return globalDb
    }
    const pool = new Pool({ connectionString })
    database = drizzlePg(pool, { schema })
  }

  // Store in request-scoped ALS if available
  const store = requestDb.getStore()
  if (store) {
    store.current = database
  }

  // Also set global for backward compatibility (tests, seed scripts)
  globalDb = database

  return database
}

export function getDb(): Database {
  // Prefer request-scoped instance to avoid cross-request I/O leaks
  const store = requestDb.getStore()
  if (store?.current) {
    return store.current
  }
  // Fallback to global for non-ALS environments
  if (globalDb) {
    return globalDb
  }
  throw new Error('Database not initialized')
}

// Export a reset function for testing purposes only
export function resetDbForTesting() {
  globalDb = undefined
}

// Export the Database type for use in other modules
export type { Database, NeonDatabase, NodeDatabase, Schema }

// Re-export drizzle-orm operators for consistent type usage across the monorepo
export { and, asc, desc, eq, ilike, inArray, isNotNull, isNull, like, notInArray, or, sql } from 'drizzle-orm'
