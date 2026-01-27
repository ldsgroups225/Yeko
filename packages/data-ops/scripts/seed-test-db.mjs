#!/usr/bin/env node
import { Pool } from 'pg'
import { hashPassword } from 'better-auth/crypto'
import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// --- Configuration & Constants ---

// Constants for seed data
const CONSTANTS = {
  EMAIL: 'enseignant@ecole.com',
  NAME: 'Test Teacher',
  PASSWORD: 'password', // Only for local/test environments
  SCHOOL_CODE: 'TEST-SCHOOL-001',
  SCHOOL_NAME: 'Ecole Test E2E',
  TRACK_CODE: 'GEN',
  GRADE_CODE: '6EME',
  SUBJECT_SHORT: 'HG',
  CURRENT_YEAR_NAME: '2025-2026',
  // --- New Constants ---
  ED_LEVEL_MATERNELLE: 'Maternelle',
  ED_LEVEL_PRIMAIRE: 'Primaire',
  ED_LEVEL_SECONDAIRE: 'Secondaire',
  ED_LEVEL_SUPERIEUR: 'Supérieur',
  STATUS_ACTIVE: 'active',
  STATUS_INACTIVE: 'inactive',
  STATUS_PENDING: 'pending',
  STATUS_CONFIRMED: 'confirmed',
  CAT_LITTERAIRE: 'Littéraire',
}

const ROLES_DATA = [
  {
    name: 'Professeur / Enseignant',
    slug: 'teacher',
    description: 'Cœur pédagogique : saisie des notes, appréciations et suivi académique.',
    scope: 'school',
    permissions: {
      students: ['view'],
      classes: ['view'],
      grades: ['view', 'create', 'edit'],
      school_subjects: ['view'],
      attendance: ['view', 'create'],
    },
  },
  {
    name: 'Directeur / Proviseur / Principal',
    slug: 'school_director',
    description: 'Chef opérationnel : supervision générale, validation des décisions et discipline.',
    scope: 'school',
    permissions: {
      users: ['view', 'create', 'edit'],
      teachers: ['view', 'create', 'edit'],
      staff: ['view', 'create', 'edit'],
      students: ['view', 'create', 'edit'],
      parents: ['view', 'create', 'edit'],
      classes: ['view', 'create', 'edit'],
      classrooms: ['view', 'create', 'edit'],
      grades: ['view', 'validate'],
      attendance: ['view', 'create'],
      conduct: ['view', 'create', 'validate'],
      finance: ['view'],
      reports: ['view', 'export'],
      settings: ['view'],
      school_subjects: ['view'],
      coefficients: ['view'],
    },
  },
]

// Safety check: Prevent running in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ FATAL: This seed script destroys data. Do NOT run in production.')
  process.exit(1)
}

// Resolve paths independent of CWD
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Path: packages/data-ops/scripts/ -> ../../../apps/teacher/.env
const envPath = path.resolve(__dirname, '../../../apps/teacher/.env')

// Load environment variables
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else if (!process.env.DATABASE_URL && !process.env.DATABASE_HOST) {
  console.error(`❌ .env file not found at: ${envPath} and no DB config in env.`)
  process.exit(1)
}

const { DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_NAME } = process.env
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME || 'neondb'}`

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
})

/**
 * Cleanup existing test data to ensure a clean slate
 */
/**
 * Cleanup existing test data to ensure a clean slate
 * Uses specific try/catch blocks to identify failure points
 */
async function cleanupDatabase(client) {
  console.log('🗑️  Cleaning up existing data...')
  
  try {
    // 1. Cleanup User by Email
    const userRes = await client.query('SELECT id FROM auth_user WHERE email = $1', [CONSTANTS.EMAIL])
    if (userRes.rows.length > 0) {
      const authId = userRes.rows[0].id
      
      // Find linked public user
      const publicUserRes = await client.query('SELECT id FROM users WHERE auth_user_id = $1', [authId])
      if (publicUserRes.rows.length > 0) {
        const userId = publicUserRes.rows[0].id
        await client.query('DELETE FROM teachers WHERE user_id = $1', [userId])
        await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId])
        await client.query('DELETE FROM users WHERE id = $1', [userId])
      }
      
      await client.query('DELETE FROM auth_account WHERE user_id = $1', [authId])
      await client.query('DELETE FROM auth_user WHERE id = $1', [authId])
    }
    
    // Cleanup Inactive User
    const inactiveRes = await client.query('SELECT id FROM auth_user WHERE email = $1', ['inactive@ecole.com'])
    if (inactiveRes.rows.length > 0) {
      const authId = inactiveRes.rows[0].id
      await client.query('DELETE FROM users WHERE auth_user_id = $1', [authId])
      await client.query('DELETE FROM auth_account WHERE user_id = $1', [authId])
      await client.query('DELETE FROM auth_user WHERE id = $1', [authId])
    }
  } catch (error) {
    console.warn('⚠️  Warning: Failed to cleanup User data', error.message)
    // Continue - soft fail
  }

  try {
    // 2. Cleanup School by Code
    const schoolRes = await client.query('SELECT id FROM schools WHERE code = $1', [CONSTANTS.SCHOOL_CODE])
    if (schoolRes.rows.length > 0) {
      const schoolId = schoolRes.rows[0].id
      
      console.log('  - Cleaning up school dependencies...')
      
      // Delete from bottom up
      try {
        await client.query(`
          DELETE FROM enrollments 
          WHERE student_id IN (SELECT id FROM students WHERE school_id = $1)
             OR class_id IN (SELECT id FROM classes WHERE school_id = $1)
        `, [schoolId])
      } catch (e) { console.warn('    - Failed clearing enrollments', e.message) }

      try {
        await client.query('DELETE FROM classes WHERE school_id = $1', [schoolId])
      } catch (e) { console.warn('    - Failed clearing classes', e.message) }

      try {
        await client.query('DELETE FROM students WHERE school_id = $1', [schoolId])
      } catch (e) { console.warn('    - Failed clearing students', e.message) }

      try {
        await client.query('DELETE FROM school_years WHERE school_id = $1', [schoolId])
      } catch (e) { console.warn('    - Failed clearing school_years', e.message) }
      
      try {
         await client.query('DELETE FROM teachers WHERE school_id = $1', [schoolId])
      } catch (e) { console.warn('    - Failed clearing teachers', e.message) }
      
      await client.query('DELETE FROM schools WHERE id = $1', [schoolId])
    }
  } catch (error) {
    console.error('❌ Error: Failed to cleanup School data', error.message)
    throw error // Hard fail if school cleanup fails entirely
  }
  
  console.log('✓ Cleanup complete')
}

/**
 * Determine ids for static curriculum data
 */
async function seedCurriculum(client) {
  // Education Levels (Idempotent)
  await client.query(`
    INSERT INTO education_levels (id, name, "order") 
    VALUES (1, $1, 1), (2, $2, 2), (3, $3, 3), (4, $4, 4) 
    ON CONFLICT (id) DO NOTHING
  `, [CONSTANTS.ED_LEVEL_MATERNELLE, CONSTANTS.ED_LEVEL_PRIMAIRE, CONSTANTS.ED_LEVEL_SECONDAIRE, CONSTANTS.ED_LEVEL_SUPERIEUR])

  // Track
  let trackId
  const trackRes = await client.query(`SELECT id FROM tracks WHERE code = $1`, [CONSTANTS.TRACK_CODE])
  if (trackRes.rows.length > 0) {
    trackId = trackRes.rows[0].id
  } else {
    trackId = randomUUID()
    await client.query(`
      INSERT INTO tracks (id, name, code, education_level_id, created_at, updated_at) 
      VALUES ($1, 'Général', $2, 3, NOW(), NOW())
    `, [trackId, CONSTANTS.TRACK_CODE])
  }

  // Grade
  let gradeId
  const gradeRes = await client.query(`SELECT id FROM grades WHERE code = $1 AND track_id = $2`, [CONSTANTS.GRADE_CODE, trackId])
  if (gradeRes.rows.length > 0) {
    gradeId = gradeRes.rows[0].id
  } else {
    gradeId = randomUUID()
    await client.query(`
      INSERT INTO grades (id, name, code, "order", track_id, created_at, updated_at) 
      VALUES ($1, 'Sixième', $2, 1, $3, NOW(), NOW())
    `, [gradeId, CONSTANTS.GRADE_CODE, trackId])
  }

  // Subject
  let subjectId
  const subjectRes = await client.query(`SELECT id FROM subjects WHERE short_name = $1`, [CONSTANTS.SUBJECT_SHORT])
  if (subjectRes.rows.length > 0) {
    subjectId = subjectRes.rows[0].id
  } else {
    subjectId = randomUUID()
    await client.query(`
      INSERT INTO subjects (id, name, short_name, category, created_at, updated_at) 
      VALUES ($1, 'Histoire-Géo', $2, $3, NOW(), NOW())
    `, [subjectId, CONSTANTS.SUBJECT_SHORT, CONSTANTS.CAT_LITTERAIRE])
  }

  return { trackId, gradeId, subjectId }
}

async function seedRoles(client) {
  console.log('Seeding Roles...')
  const rolesMap = {}

  for (const role of ROLES_DATA) {
    // Check if role exists
    const res = await client.query('SELECT id FROM roles WHERE slug = $1', [role.slug])
    let roleId

    if (res.rows.length > 0) {
      roleId = res.rows[0].id
    } else {
      roleId = randomUUID()
      await client.query(`
        INSERT INTO roles (id, name, slug, description, scope, permissions, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `, [roleId, role.name, role.slug, role.description, role.scope, role.permissions])
    }
    rolesMap[role.slug] = roleId
  }
  return rolesMap
}

async function seedUserAndSchool(client) {
  // 1. Auth User
  const authUserId = randomUUID()
  const hashedPassword = await hashPassword(CONSTANTS.PASSWORD)
  
  await client.query(
    `INSERT INTO auth_user (id, name, email, email_verified, created_at, updated_at)
     VALUES ($1, $2, $3, true, NOW(), NOW())`,
    [authUserId, CONSTANTS.NAME, CONSTANTS.EMAIL]
  )

  await client.query(
    `INSERT INTO auth_account (id, "account_id", provider_id, user_id, password, created_at, updated_at)
     VALUES ($1, $2, 'credential', $3, $4, NOW(), NOW())`,
    [randomUUID(), CONSTANTS.EMAIL, authUserId, hashedPassword]
  )
  console.log('✓ Auth user seeded')

  // 2. Public User
  const userId = randomUUID()
  await client.query(
    `INSERT INTO users (id, auth_user_id, email, name, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
    [userId, authUserId, CONSTANTS.EMAIL, CONSTANTS.NAME, CONSTANTS.STATUS_ACTIVE]
  )
  console.log('✓ Public user seeded')

  // 3. School
  const schoolId = randomUUID()
  await client.query(
    `INSERT INTO schools (id, name, code, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())`,
    [schoolId, CONSTANTS.SCHOOL_NAME, CONSTANTS.SCHOOL_CODE, CONSTANTS.STATUS_ACTIVE]
  )
  console.log('✓ School seeded')

  // 4. Teacher Profile
  const teacherId = randomUUID()
  await client.query(
    `INSERT INTO teachers (id, user_id, school_id, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())`,
    [teacherId, userId, schoolId, CONSTANTS.STATUS_ACTIVE]
  )
  console.log('✓ Teacher seeded')

  return { schoolId, userId, authUserId, teacherId }
}

async function assignUserRole(client, userId, schoolId, roleId) {
  await client.query(`
    INSERT INTO user_roles (id, user_id, role_id, school_id, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (user_id, role_id, school_id) DO NOTHING
  `, [randomUUID(), userId, roleId, schoolId])
  
  console.log('✓ User role assigned')
}

async function seedEnrollments(client, schoolId, gradeId) {
  // 1. School Year Logic (Idempotent)
  let templateId
  const tempRes = await client.query(`SELECT id FROM school_year_templates WHERE name = '2025-2026'`)
  if (tempRes.rows.length > 0) {
    templateId = tempRes.rows[0].id
  } else {
    // FIX: Consistent UUID generation
    const newTempId = randomUUID()
    await client.query(`
      INSERT INTO school_year_templates (id, name, is_active, created_at, updated_at) 
      VALUES ($1, $2, true, NOW(), NOW()) 
    `, [newTempId, CONSTANTS.CURRENT_YEAR_NAME])
    templateId = newTempId
  }

  let schoolYearId
  const syRes = await client.query(`SELECT id FROM school_years WHERE school_id = $1 AND school_year_template_id = $2`, [schoolId, templateId])
  if (syRes.rows.length > 0) {
    schoolYearId = syRes.rows[0].id
  } else {
    schoolYearId = randomUUID()
    await client.query(
      `INSERT INTO school_years (id, school_id, school_year_template_id, start_date, end_date, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, '2025-09-01', '2026-06-30', true, NOW(), NOW())`,
      [schoolYearId, schoolId, templateId]
    )
    console.log('✓ School Year seeded')
  }

  // 2. Class Logic (Idempotent)
  let classId
  const classRes = await client.query(`
    SELECT id FROM classes 
    WHERE school_id = $1 AND school_year_id = $2 AND grade_id = $3 AND section = 'A'
  `, [schoolId, schoolYearId, gradeId])
  
  if (classRes.rows.length > 0) {
    classId = classRes.rows[0].id
  } else {
    classId = randomUUID()
    await client.query(
      `INSERT INTO classes (id, school_id, school_year_id, grade_id, section, max_students, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'A', 30, 'active', NOW(), NOW())`,
      [classId, schoolId, schoolYearId, gradeId]
    )
    console.log('✓ Class seeded')
  }

  // 3. Student Logic (Idempotent)
  let studentId
  const stuRes = await client.query(`
    SELECT id FROM students WHERE school_id = $1 AND matricule = 'MAT-001'
  `, [schoolId])
  
  if (stuRes.rows.length > 0) {
    studentId = stuRes.rows[0].id
  } else {
    studentId = randomUUID()
    await client.query(
      `INSERT INTO students (id, school_id, first_name, last_name, dob, matricule, status, created_at, updated_at)
       VALUES ($1, $2, 'Jean', 'Dupont', '2015-05-15', 'MAT-001', 'active', NOW(), NOW())`,
      [studentId, schoolId]
    )
    console.log('✓ Student seeded')
  }

  // 4. Enrollment Logic (Idempotent)
  const enrRes = await client.query(`
    SELECT id FROM enrollments WHERE student_id = $1 AND class_id = $2 AND school_year_id = $3
  `, [studentId, classId, schoolYearId])
  
  if (enrRes.rows.length === 0) {
    await client.query(
      `INSERT INTO enrollments (id, student_id, class_id, school_year_id, status, enrollment_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'confirmed', NOW(), NOW(), NOW())`,
      [randomUUID(), studentId, classId, schoolYearId]
    )
    console.log('✓ Enrollment seeded')
  }

  return { classId, schoolYearId }
}

async function seedClassSubjects(client, teacherId, classId, subjectId) {
  const res = await client.query(`
    SELECT id FROM class_subjects 
    WHERE class_id = $1 AND subject_id = $2 AND teacher_id = $3
  `, [classId, subjectId, teacherId])

  if (res.rows.length === 0) {
    await client.query(`
      INSERT INTO class_subjects (id, class_id, subject_id, teacher_id, coefficient, hours_per_week, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 2, 4, 'active', NOW(), NOW())
    `, [randomUUID(), classId, subjectId, teacherId])
    console.log('✓ Class Subject seeded (Linking Teacher to Class)')
  }
}

async function seedUnhappyPaths(client, schoolId) {
  console.log('🧪 Seeding unhappy paths (Edge Cases)...')
  
  // 1. Inactive User
  const inactiveUserId = randomUUID()
  const inactiveAuthId = randomUUID()
  await client.query(
    `INSERT INTO auth_user (id, name, email, email_verified, created_at, updated_at)
     VALUES ($1, 'Inactive Teacher', 'inactive@ecole.com', true, NOW(), NOW())`,
    [inactiveAuthId]
  )
  await client.query(
    `INSERT INTO users (id, auth_user_id, email, name, status, created_at, updated_at)
     VALUES ($1, $2, 'inactive@ecole.com', 'Inactive Teacher', $3, NOW(), NOW())`,
    [inactiveUserId, inactiveAuthId, CONSTANTS.STATUS_INACTIVE]
  )
  console.log('  - Inactive User seeded')

  // 2. Student without Class
  const studentNoClassId = randomUUID()
  await client.query(
    `INSERT INTO students (id, school_id, first_name, last_name, dob, matricule, status, created_at, updated_at)
     VALUES ($1, $2, 'NoClass', 'Student', '2016-01-01', 'MAT-ERR-001', $3, NOW(), NOW())`,
    [studentNoClassId, schoolId, CONSTANTS.STATUS_ACTIVE]
  )
  console.log('  - Student without Class seeded')

  // 3. Pending Enrollment
  // Need a class for this
  const classRes = await client.query('SELECT id, school_year_id FROM classes WHERE school_id = $1 LIMIT 1', [schoolId])
  if (classRes.rows.length > 0) {
    const { id: classId, school_year_id: syId } = classRes.rows[0]
    const pendingStudentId = randomUUID()
    
    await client.query(
      `INSERT INTO students (id, school_id, first_name, last_name, dob, matricule, status, created_at, updated_at)
       VALUES ($1, $2, 'Pending', 'Enrollment', '2016-01-02', 'MAT-PEND-001', $3, NOW(), NOW())`,
      [pendingStudentId, schoolId, CONSTANTS.STATUS_ACTIVE]
    )

    await client.query(
      `INSERT INTO enrollments (id, student_id, class_id, school_year_id, status, enrollment_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())`,
      [randomUUID(), pendingStudentId, classId, syId, CONSTANTS.STATUS_PENDING]
    )
    console.log('  - Pending Enrollment seeded')
  }
}

// --- Main Execution ---

async function seedDatabase() {
  const client = await pool.connect()
  try {
    console.log('🌱 Seeding test database...')
    await client.query('BEGIN')

    await cleanupDatabase(client)
    
    // Core data
    const rolesMap = await seedRoles(client) // Seed roles first
    const { schoolId, userId, teacherId } = await seedUserAndSchool(client)
    
    // Assign Teacher Roler
    if (rolesMap['teacher']) {
      await assignUserRole(client, userId, schoolId, rolesMap['teacher'])
    }
    
    const { gradeId, subjectId } = await seedCurriculum(client)
    
    // Enrollments
    const { classId, schoolYearId } = await seedEnrollments(client, schoolId, gradeId)

    // Bridge: Class + Teacher + Subject
    await seedClassSubjects(client, teacherId, classId, subjectId)
    
    // Edge Cases
    await seedUnhappyPaths(client, schoolId)

    await client.query('COMMIT')
    console.log('✅ Seeding complete!')
  }
  catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
  finally {
    client.release()
    await pool.end()
  }
}

seedDatabase()
