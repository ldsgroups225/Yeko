import { getDb } from '../database/setup'
import { schools, schoolYearTemplates, tracks, grades, educationLevels } from '../drizzle/core-schema'
import { students, enrollments, classes, schoolYears } from '../drizzle/school-schema'
import { transferStudent } from '../queries/school-admin/enrollments'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { afterAll, beforeAll, describe, test } from 'vitest'

async function measureTime(fn: () => Promise<any>): Promise<{ result: any, duration: number }> {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  return { result, duration }
}

describe('transferStudent benchmark', () => {
  let testSchoolId: string
  let testEnrollmentId: string
  let testNewClassId: string

  beforeAll(async () => {
    const db = getDb()

    // Create school
    testSchoolId = nanoid()
    await db.insert(schools).values({
      id: testSchoolId,
      name: 'Benchmark School',
      code: 'BENCH-' + nanoid(5),
      status: 'active',
    })

    // Get or create education level
    let level = await db.query.educationLevels.findFirst()
    if (!level) {
        await db.insert(educationLevels).values({ id: 1, name: 'Primaire', order: 1 })
        level = { id: 1, name: 'Primaire', order: 1 }
    }

    // Create track
    const trackId = nanoid()
    await db.insert(tracks).values({
      id: trackId,
      name: 'Benchmark Track',
      code: 'BTRACK-' + nanoid(5),
      educationLevelId: level.id,
    })

    // Create grade
    const gradeId = nanoid()
    await db.insert(grades).values({
      id: gradeId,
      name: 'Benchmark Grade',
      code: 'BGRADE-' + nanoid(5),
      order: 1,
      trackId,
    })

    // Create school year template
    const schoolYearTemplateId = nanoid()
    await db.insert(schoolYearTemplates).values({
      id: schoolYearTemplateId,
      name: '2024-2025',
      isActive: true,
    })

    // Create school year
    const schoolYearId = nanoid()
    await db.insert(schoolYears).values({
      id: schoolYearId,
      schoolId: testSchoolId,
      schoolYearTemplateId,
      startDate: '2024-09-01',
      endDate: '2025-06-30',
      isActive: true,
    })

    // Create student
    const studentId = nanoid()
    await db.insert(students).values({
      id: studentId,
      schoolId: testSchoolId,
      firstName: 'Bench',
      lastName: 'Student',
      dob: '2015-01-01',
      matricule: 'MAT-' + nanoid(5),
    })

    // Create classes
    const class1Id = nanoid()
    await db.insert(classes).values({
      id: class1Id,
      schoolId: testSchoolId,
      schoolYearId,
      gradeId,
      section: 'A',
    })

    testNewClassId = nanoid()
    await db.insert(classes).values({
      id: testNewClassId,
      schoolId: testSchoolId,
      schoolYearId,
      gradeId,
      section: 'B',
    })

    // Create enrollment
    testEnrollmentId = nanoid()
    await db.insert(enrollments).values({
        id: testEnrollmentId,
        studentId,
        classId: class1Id,
        schoolYearId,
        enrollmentDate: '2024-09-01',
        status: 'confirmed',
    })
  })

  afterAll(async () => {
    const db = getDb()
    // Cleanup - thanks to afterEach(cleanupDatabase) in setup.ts we might not need this,
    // but better be safe for things not covered by cleanupDatabase if any.
    // Actually, cleanupDatabase usually truncates all tables.
  })

  test('measure transferStudent performance', async () => {
    // Warm up
    for(let i=0; i<3; i++) {
        await transferStudent({
            enrollmentId: testEnrollmentId,
            newClassId: testNewClassId,
            schoolId: testSchoolId,
            transferDate: new Date(),
        })
    }

    const iterations = 10
    let totalDuration = 0
    for(let i=0; i<iterations; i++) {
        const { duration } = await measureTime(async () => {
            return transferStudent({
                enrollmentId: testEnrollmentId,
                newClassId: testNewClassId,
                schoolId: testSchoolId,
                transferDate: new Date(),
            })
        })
        totalDuration += duration
    }

    console.warn(`Average transferStudent duration: ${totalDuration / iterations}ms`)
  })
})
