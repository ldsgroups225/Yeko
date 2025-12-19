// packages/data-ops/src/database/setup.ts

import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeonHttp } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as authSchema from '@/drizzle/auth-schema'
import * as coreSchema from '@/drizzle/core-schema'
import * as schoolSchema from '@/drizzle/school-schema'

let db: any

export function initDatabase(connection: {
  host: string
  username: string
  password: string
}) {
  const connectionString = `postgres://${connection.username}:${connection.password}@${connection.host}`

  // Check if it's a Neon connection (contains .neon.tech or sslmode=require)
  if (connection.host.includes('.neon.tech') || connection.host.includes('sslmode=')) {
    // Use Neon HTTP driver for Cloudflare Workers - stateless, no connection reuse issues
    const sql = neon(connectionString)
    db = drizzleNeonHttp({ client: sql, schema: { ...authSchema, ...coreSchema, ...schoolSchema } })
  }
  else {
    // Use standard PostgreSQL connection (cached for non-serverless)
    if (db) {
      return db
    }
    const pool = new Pool({ connectionString })
    db = drizzlePg(pool, { schema: { ...authSchema, ...coreSchema, ...schoolSchema } })
  }

  return db
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}

// Export a reset function for testing purposes only
export function resetDbForTesting() {
  db = undefined
}
