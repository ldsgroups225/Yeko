import { auth } from '../../config/auth.js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as coreSchema from '../drizzle/core-schema.js'

// Load env vars
const connectionString = `postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}`
const client = postgres(connectionString)
const db = drizzle(client, { schema: coreSchema })

export async function createTestUser() {
  try {
    // Create a test user with email and password
    const testUser = await auth.api.signUpEmail({
      body: {
        email: 'admin@yeko.test',
        password: 'password123',
        name: 'Test Admin',
      },
    })

    console.log('✅ Test user created: admin@yeko.test')
    return testUser
  } catch (error) {
    console.log('ℹ️ Test user might already exist or there was an error:', error)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestUser()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error creating test user:', error)
      process.exit(1)
    })
}
