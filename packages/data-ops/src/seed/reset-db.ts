import fs from 'node:fs'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// Load env vars if needed
if (!process.env.DATABASE_HOST) {
  try {
    const envContent = fs.readFileSync('.env', 'utf-8')
    envContent.split('\n').forEach((line) => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=').trim()
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1)
        }
        process.env[key.trim()] = value
      }
    })
  }
  catch (e) {
    console.warn('Could not load .env file', e)
    process.exit(1)
  }
}

const connectionString = process.env.DATABASE_URL || `postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}?sslmode=verify-full`

async function resetDatabase() {
  console.log('🔄 Resetting database...')

  const client = postgres(connectionString, { max: 1 })

  try {
    // Drop all tables and recreate schema
    console.log('🧹 Dropping all tables...')
    await client`DROP SCHEMA public CASCADE`
    await client`CREATE SCHEMA public`
    await client`GRANT ALL ON SCHEMA public TO CURRENT_USER`
    await client`GRANT ALL ON SCHEMA public TO public`

    console.log('✅ Database schema reset complete')
  }
  catch (error) {
    console.error('❌ Error resetting database:', error)
    throw error
  }
  finally {
    await client.end()
  }
}

async function main() {
  try {
    await resetDatabase()
    console.log('🎉 Database reset successfully!')
    process.exit(0)
  }
  catch (error) {
    console.error('❌ Database reset failed:', error)
    process.exit(1)
  }
}

main()
