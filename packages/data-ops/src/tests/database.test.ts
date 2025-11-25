import { describe, expect, test } from 'vitest'
import { getDb, initDatabase, resetDbForTesting } from '../database/setup'

describe('database setup', () => {
  test('should initialize database and return instance', () => {
    // Reset to ensure clean state
    resetDbForTesting()

    // Initialize database
    const db = initDatabase({
      host: process.env.POSTGRES_HOST || 'localhost',
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
    })

    expect(db).toBeDefined()

    // Should be able to get the same instance
    const db2 = getDb()
    expect(db2).toBeDefined()
  })

  test('should throw error when getting database before initialization', () => {
    // Reset database to uninitialized state
    resetDbForTesting()

    expect(() => getDb()).toThrow('Database not initialized')
  })

  test('should return existing database instance when initializing twice', () => {
    // Initialize database first time
    const db1 = initDatabase({
      host: process.env.POSTGRES_HOST || 'localhost',
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
    })

    // Initialize again - should return same instance
    const db2 = initDatabase({
      host: process.env.POSTGRES_HOST || 'localhost',
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
    })

    expect(db1).toBe(db2)
  })

  test('should handle Neon database connection', () => {
    // Reset to ensure clean state
    resetDbForTesting()

    // Test Neon connection (mock)
    const db = initDatabase({
      host: 'test.neon.tech',
      username: 'testuser',
      password: 'testpass',
    })

    expect(db).toBeDefined()
  })

  test('should reset database for testing', () => {
    // Initialize database
    initDatabase({
      host: process.env.POSTGRES_HOST || 'localhost',
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
    })

    // Should be able to get database
    expect(() => getDb()).not.toThrow()

    // Reset and verify error is thrown
    resetDbForTesting()
    expect(() => getDb()).toThrow('Database not initialized')
  })
})
