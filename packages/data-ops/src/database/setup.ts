// packages/data-ops/src/database/setup.ts

import { drizzle } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

let db: any

export function initDatabase(connection: {
  host: string
  username: string
  password: string
}) {
  if (db) {
    return db
  }

  const connectionString = `postgres://${connection.username}:${connection.password}@${connection.host}`

  // Check if it's a Neon connection (contains .neon.tech or sslmode=require)
  if (connection.host.includes('.neon.tech') || connection.host.includes('sslmode=')) {
    // Use Neon HTTP connection
    db = drizzle(connectionString)
  }
  else {
    // Use standard PostgreSQL connection
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
