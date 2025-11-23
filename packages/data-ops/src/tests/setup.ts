import path from 'node:path'
import dotenv from 'dotenv'
import { beforeAll } from 'vitest'
import { initDatabase } from '../database/setup'

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') })

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
    // eslint-disable-next-line no-console
    console.log('✓ Test database initialized')
  }
  catch (error) {
    console.error('Failed to initialize test database:', error)
    throw error
  }
})
