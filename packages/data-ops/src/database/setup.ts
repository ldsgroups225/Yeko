// packages/data-ops/src/database/setup.ts

import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
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

let db: Database | undefined

export function initDatabase(connection: {
  host: string
  username: string
  password: string
}): Database {
  const connectionString = `postgres://${connection.username}:${connection.password}@${connection.host}`

  // Check if it's a Neon connection (contains .neon.tech or sslmode=require)
  if (connection.host.includes('.neon.tech') || connection.host.includes('sslmode=')) {
    // Use Neon HTTP driver for Cloudflare Workers - stateless, no connection reuse issues
    const sql = neon(connectionString)
    db = drizzleNeonHttp({ client: sql, schema })
  }
  else {
    // Use standard PostgreSQL connection (cached for non-serverless)
    if (db) {
      return db
    }
    const pool = new Pool({ connectionString })
    db = drizzlePg(pool, { schema })
  }

  return db
}

export function getDb(): Database {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}

// Export a reset function for testing purposes only
export function resetDbForTesting() {
  db = undefined
}

// Export the Database type for use in other modules
export type { Database, NeonDatabase, NodeDatabase, Schema }
