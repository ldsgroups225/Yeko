// packages/data-ops/src/database/setup.ts

import { Pool as NeonPool } from '@neondatabase/serverless'
import { drizzle as drizzleNeonServerless } from 'drizzle-orm/neon-serverless'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

let db: any
let neonPool: NeonPool | null = null

export function initDatabase(connection: {
  host: string
  username: string
  password: string
}) {
  const connectionString = `postgres://${connection.username}:${connection.password}@${connection.host}`

  // Check if it's a Neon connection (contains .neon.tech or sslmode=require)
  if (connection.host.includes('.neon.tech') || connection.host.includes('sslmode=')) {
    // Use Neon Serverless driver with WebSocket support for transactions
    neonPool = new NeonPool({ connectionString })
    db = drizzleNeonServerless({ client: neonPool })
  }
  else {
    // Use standard PostgreSQL connection (cached for non-serverless)
    if (db) {
      return db
    }
    const pool = new Pool({ connectionString })
    db = drizzlePg(pool)
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
