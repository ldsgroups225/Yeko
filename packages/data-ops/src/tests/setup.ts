import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { afterEach, beforeAll } from 'vitest'
import { initDatabase } from '../database/setup'
import { cleanupDatabase } from './db-cleanup'

// Load environment variables
const envTestPath = path.resolve(__dirname, '../../.env.test')
const envPath = path.resolve(__dirname, '../../.env')

if (fs.existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath })
}
else {
  dotenv.config({ path: envPath })
}

// Initialize database before all tests
beforeAll(async () => {
  // Initialize with test database credentials from environment
  const host = process.env.DATABASE_HOST || process.env.TEST_DATABASE_HOST
  const username = process.env.DATABASE_USERNAME || process.env.TEST_DATABASE_USERNAME
  const password = process.env.DATABASE_PASSWORD || process.env.TEST_DATABASE_PASSWORD

  if (!host || !username || !password) {
    console.warn('Database credentials not found in environment. Tests may fail.')
  }

  try {
    await initDatabase({
      host: host!,
      username: username!,
      password: password!,
    })
    console.warn('✓ Test database initialized')
  }
  catch (error) {
    console.error('Failed to initialize test database:', error)
    throw error
  }
})

// Cleanup database after each test
afterEach(async () => {
  await cleanupDatabase()
})
