import type { SubjectCategory, TermType } from '../drizzle/core-schema.js'
import fs from 'node:fs'
import { eq, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as coreSchema from '../drizzle/core-schema.js'
import * as schoolSchema from '../drizzle/school-schema.js'
import { educationLevelsData } from './educationLevelsData.js'
import { gradesData } from './gradesData.js'
import { seriesData } from './seriesData.js'
import { subjectsData } from './subjectsData.js'
import { termsData } from './termData.js'
import { tracksData } from './tracksData.js'
import { defaultRoles } from './rolesData.js'
import { feeTypesData } from './feeTypesData.js'
import { feeTypeTemplatesData } from './feeTypeTemplatesData.js'

// Manually load .env if not present
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
  }
}

// Load env vars if needed, or assume they are present in environment
const connectionString = `postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}`

const client = postgres(connectionString)
const db = drizzle(client, { schema: { ...coreSchema, ...schoolSchema } })

async function clearCoreTables() {
  console.log('🧹 Clearing existing data (excluding auth tables)...')

  // Delete in reverse order of dependencies to avoid foreign key constraints
  await db.delete(coreSchema.coefficientTemplates)
  await db.delete(coreSchema.programTemplateChapters)
  await db.delete(coreSchema.programTemplates)
  await db.delete(coreSchema.termTemplates)
  await db.delete(coreSchema.schoolYearTemplates)
  await db.delete(coreSchema.subjects)
  await db.delete(coreSchema.series)
  await db.delete(coreSchema.grades)
  await db.delete(coreSchema.tracks)
  await db.delete(coreSchema.educationLevels)

  // Clear school tables (feeTypes before feeTypeTemplates due to FK)
  await db.delete(schoolSchema.feeTypes)
  await db.delete(coreSchema.feeTypeTemplates)
  await db.delete(schoolSchema.roles)

  console.log('✅ Core tables cleared')
}

async function main() {
  const args = process.argv.slice(2)
  const isFresh = args.includes('--fresh')

  if (isFresh) {
    await clearCoreTables()
    console.log('🌱 Fresh seeding database...')
  }
  else {
    console.log('🌱 Seeding database...')
  }

  // --- Level 0 ---

  console.log('Seeding Education Levels...')
  const seedMethod = isFresh
    ? db.insert(coreSchema.educationLevels).values(educationLevelsData)
    : db.insert(coreSchema.educationLevels).values(educationLevelsData).onConflictDoNothing()
  await seedMethod

  console.log('Seeding Roles...')

  // Helper to expand 'manage' shorthand to actual CRUD permissions
  type SystemAction = 'view' | 'create' | 'edit' | 'delete' | 'manage' | 'export' | 'validate' | 'enroll' | 'process_payment'
  type SystemPermissions = Record<string, SystemAction[]>

  function expandManagePermissions(permissions: SystemPermissions): SystemPermissions {
    const expanded: SystemPermissions = {}
    for (const [resource, actions] of Object.entries(permissions)) {
      const expandedActions: SystemAction[] = []
      for (const action of actions) {
        if (action === 'manage') {
          // Expand 'manage' to create, edit, delete
          expandedActions.push('create', 'edit', 'delete')
        }
        else {
          expandedActions.push(action)
        }
      }
      // Remove duplicates
      expanded[resource] = [...new Set(expandedActions)]
    }
    return expanded
  }

  // Optimize Roles Insertion with Bulk Insert
  const mappedRoles = defaultRoles.map(role => ({
    id: crypto.randomUUID(),
    ...role,
    permissions: expandManagePermissions(role.permissions as SystemPermissions),
  }))

  if (isFresh) {
    await db.insert(schoolSchema.roles).values(mappedRoles)
  }
  else {
    await db.insert(schoolSchema.roles).values(mappedRoles).onConflictDoUpdate({
      target: schoolSchema.roles.slug,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        permissions: sql`excluded.permissions`,
        extraLanguages: sql`excluded.extra_languages`,
        updatedAt: new Date(),
      },
    })
  }

  console.log('Seeding Fee Type Templates (Core)...')

  if (isFresh) {
    await db.insert(coreSchema.feeTypeTemplates).values(feeTypeTemplatesData)
  } else {
    await db.insert(coreSchema.feeTypeTemplates).values(feeTypeTemplatesData).onConflictDoNothing({ target: coreSchema.feeTypeTemplates.code })
  }

  console.log('Seeding Tracks...')

  const tracksWithIds = tracksData.map(track => ({ id: crypto.randomUUID(), ...track }))
  if (isFresh) {
      await db.insert(coreSchema.tracks).values(tracksWithIds)
  } else {
      await db.insert(coreSchema.tracks).values(tracksWithIds).onConflictDoNothing({ target: coreSchema.tracks.code })
  }

  const generalTrack = await db.query.tracks.findFirst({ where: eq(coreSchema.tracks.code, 'GEN') })
  const techTrack = await db.query.tracks.findFirst({ where: eq(coreSchema.tracks.code, 'TECH') })

  if (!generalTrack || !techTrack) {
    throw new Error('Tracks not found after seeding')
  }

  // --- Level 1 ---

  console.log('Seeding Grades...')

  // Grades rely on trackId which we just fetched.
  // We can bulk insert grades for the General Track.
  const grades = gradesData(generalTrack.id).map(g => ({ id: crypto.randomUUID(), ...g }))

  if (isFresh) {
    await db.insert(coreSchema.grades).values(grades)
  }
  else {
    // For grades, we can't easily do a single bulk onConflict because code + trackId is the unique key,
    // but the schema might not have a composite unique constraint defined in a way that ON CONFLICT supports directly
    // without a named constraint.
    // However, looking at the original code:
    // "Check if exists to avoid duplicates (since code is not unique globally)"
    // The original code does a `findFirst` inside the loop.
    // Optimizing this safely requires knowing if there is a unique constraint on (code, trackId).
    // Let's assume there isn't one easily usable for DO NOTHING without potentially erroring if multiple match.
    // So we will stick to the loop for safety here, or implement a read-then-filter-then-bulk-insert pattern.

    // Optimization: Read all existing grades for this track, filter out duplicates in memory, then bulk insert new ones.
    const existingGrades = await db.query.grades.findMany({
        where: eq(coreSchema.grades.trackId, generalTrack.id)
    })
    const existingCodes = new Set(existingGrades.map(g => g.code))
    const newGrades = grades.filter(g => !existingCodes.has(g.code))

    if (newGrades.length > 0) {
        await db.insert(coreSchema.grades).values(newGrades)
    }
  }

  console.log('Seeding Series...')

  const seriesList = seriesData(generalTrack.id).map(s => ({ id: crypto.randomUUID(), ...s }))

  if (isFresh) {
    await db.insert(coreSchema.series).values(seriesList)
  }
  else {
    await db.insert(coreSchema.series).values(seriesList).onConflictDoNothing({ target: coreSchema.series.code })
  }

  console.log('Seeding Subjects...')

  const subjects = subjectsData.map(s => ({
      id: crypto.randomUUID(),
      ...s,
      category: s.category as SubjectCategory
  }))

  if (isFresh) {
    await db.insert(coreSchema.subjects).values(subjects)
  }
  else {
    // Optimization: Read all existing subjects, filter, insert new.
    // The original code checks by name.
    const existingSubjects = await db.query.subjects.findMany()
    const existingNames = new Set(existingSubjects.map(s => s.name))
    const newSubjects = subjects.filter(s => !existingNames.has(s.name))

    if (newSubjects.length > 0) {
        await db.insert(coreSchema.subjects).values(newSubjects)
    }
  }

  // --- Level 2 ---

  console.log('Seeding Templates...')
  const yearName = '2025-2026'

  let yearTemplate = await db.query.schoolYearTemplates.findFirst({ where: eq(coreSchema.schoolYearTemplates.name, yearName) })

  if (!yearTemplate || isFresh) {
    if (isFresh) {
      // Always create the school year template in fresh mode
      const res = await db.insert(coreSchema.schoolYearTemplates).values({
        id: crypto.randomUUID(),
        name: yearName,
        isActive: true,
      }).returning()
      yearTemplate = res[0]
    }
    else {
      // Create only if not exists in normal mode
      const res = await db.insert(coreSchema.schoolYearTemplates).values({
        id: crypto.randomUUID(),
        name: yearName,
        isActive: true,
      }).onConflictDoNothing().returning()
      yearTemplate = res[0]
    }
  }

  // Optimize Term Templates
  // Original code checks by name + schoolYearTemplateId
  // We can read all for this year template, filter, insert.
  if (yearTemplate) {
      const terms = termsData.map(t => ({
          id: crypto.randomUUID(),
          ...t,
          type: t.type as TermType,
          schoolYearTemplateId: yearTemplate!.id,
      }))

      if (isFresh) {
          await db.insert(coreSchema.termTemplates).values(terms)
      } else {
          const existingTerms = await db.query.termTemplates.findMany({
              where: eq(coreSchema.termTemplates.schoolYearTemplateId, yearTemplate.id)
          })
          const existingTermNames = new Set(existingTerms.map(t => t.name))
          const newTerms = terms.filter(t => !existingTermNames.has(t.name))

          if (newTerms.length > 0) {
              await db.insert(coreSchema.termTemplates).values(newTerms)
          }
      }
  }

  await client.end()
  console.log('✅ Seeding complete!')
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
