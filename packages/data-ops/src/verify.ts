import fs from 'node:fs'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './drizzle/core-schema'

// Load env
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
  catch { }
}

const connectionString = `postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}`
const client = postgres(connectionString)
const db = drizzle(client, { schema })

async function main() {
  console.log('🔍 Verifying database content...')

  const [levels, tracks, grades, series, subjects, years, terms] = await Promise.all([
    db.select().from(schema.educationLevels),
    db.select().from(schema.tracks),
    db.select().from(schema.grades),
    db.select().from(schema.series),
    db.select().from(schema.subjects),
    db.select().from(schema.schoolYearTemplates),
    db.select().from(schema.termTemplates),
  ])

  console.log(`Education Levels: ${levels.length} (Expected: 4)`)
  console.log(`Tracks: ${tracks.length} (Expected: 2)`)
  console.log(`Grades: ${grades.length} (Expected: 7)`)
  console.log(`Series: ${series.length} (Expected: 5)`)
  console.log(`Subjects: ${subjects.length} (Expected: 12)`)
  console.log(`School Years: ${years.length} (Expected: 1)`)
  console.log(`Term Templates: ${terms.length} (Expected: 5)`)

  await client.end()
}

main()
