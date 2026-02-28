import { eq } from 'drizzle-orm'
import { Result as R } from '@praha/byethrow'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { getDb, initDatabase } from '../database/setup'
import { educationLevels, grades, tracks } from '../drizzle/core-schema'
import { classes as schoolClasses, enrollments, schoolYears, schools, students } from '../drizzle/school-schema'
import { createSchoolYearTemplate } from '../queries/programs'
import { enrollStudent } from '../queries/school-admin/enrollments'
import { createSchoolYear } from '../queries/school-admin/school-years'
import { createSchool } from '../queries/schools'
import { createStudent } from '../queries/students'
import { nanoid } from 'nanoid'
import './setup'

// Helper to measure execution time
async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T, duration: number }> {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  return { result, duration }
}

describe('enrollment performance benchmark', () => {
  let testSchoolId: string
  let testSchoolYearId: string
  let testClassId: string
  let testStudentIds: string[] = []
  const BATCH_SIZE = 50

  beforeAll(async () => {
    // Force init again just in case, though it should be handled by setup.ts
    // The issue might be race condition or different context
    try {
        getDb()
    } catch (e) {
        if (process.env.DATABASE_HOST) {
            await initDatabase({
                host: process.env.DATABASE_HOST,
                username: process.env.DATABASE_USERNAME || 'postgres',
                password: process.env.DATABASE_PASSWORD || 'postgres',
            })
        }
    }

    const db = getDb()

    // 1. Create School
    const school = R.unwrap(await createSchool({
      name: `Perf Test School ${Date.now()}`,
      code: `PTS-${Date.now()}`,
      email: `perf-enroll-${Date.now()}@test.com`,
      phone: `+225${Date.now().toString().slice(-8)}`,
      status: 'active',
    }))
    testSchoolId = school.id

    // 2. Create School Year
    const yearTemplate = R.unwrap(await createSchoolYearTemplate({
      name: `Perf Year ${Date.now()}`,
      isActive: true,
    }))

    const schoolYear = R.unwrap(await createSchoolYear({
      schoolId: testSchoolId,
      schoolYearTemplateId: yearTemplate.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    }))
    testSchoolYearId = schoolYear.id

    // 3. Create Class (using raw insert for speed/simplicity)
    // Ensure education level exists
    let levelId = 1
    await db.insert(educationLevels).values({
        id: levelId,
        name: 'Test Level',
        order: 1
    }).onConflictDoNothing()

    // Ensure track exists
    let trackId;
    const existingTrack = await db.select().from(tracks).limit(1);
    if (existingTrack.length > 0) {
        trackId = existingTrack[0].id;
    } else {
        const [newTrack] = await db.insert(tracks).values({
            id: nanoid(),
            name: 'Perf Track',
            code: 'PTR',
            educationLevelId: levelId
        }).returning()
        trackId = newTrack.id
    }

    const gradeId = nanoid()
    await db.insert(grades).values({
        id: gradeId,
        name: 'Perf Test Grade',
        code: 'PTG',
        order: 99,
        trackId: trackId
    })

    const classId = nanoid()
    await db.insert(schoolClasses).values({
        id: classId,
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: gradeId,
        section: 'A',
        maxStudents: 100,
        status: 'active'
    })
    testClassId = classId

    // 4. Create Students
    for (let i = 0; i < BATCH_SIZE; i++) {
        const student = R.unwrap(await createStudent({
            schoolId: testSchoolId,
            schoolYearId: testSchoolYearId,
            firstName: `Student ${i}`,
            lastName: 'Perf',
            dob: '2015-01-01',
            matricule: `MAT-${Date.now()}-${i}`
        }))
        testStudentIds.push(student.id)
    }
  })

  test(`should measure enrollment time for ${BATCH_SIZE} students`, async () => {
    const { duration } = await measureTime(async () => {
        // Sequential Promise.all to simulate concurrent load
        const promises = testStudentIds.map(studentId =>
            enrollStudent({
                studentId,
                classId: testClassId,
                schoolYearId: testSchoolYearId,
                schoolId: testSchoolId,
                enrollmentDate: new Date()
            })
        )
        await Promise.all(promises)
    })

    console.log(`⚡ Benchmark: Enrolled ${BATCH_SIZE} students in ${duration.toFixed(2)}ms (${(duration/BATCH_SIZE).toFixed(2)}ms/student)`)
    expect(duration).toBeGreaterThan(0)
  })

  afterAll(async () => {
    const db = getDb()
    // Cleanup: delete test data
    await db.delete(enrollments).where(eq(enrollments.schoolYearId, testSchoolYearId))
    await db.delete(schoolClasses).where(eq(schoolClasses.id, testClassId))
    await db.delete(students).where(eq(students.schoolId, testSchoolId))
    await db.delete(schoolYears).where(eq(schoolYears.id, testSchoolYearId))
    await db.delete(schools).where(eq(schools.id, testSchoolId))
  })
})
