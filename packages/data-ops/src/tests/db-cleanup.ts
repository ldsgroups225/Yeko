import { ilike, inArray, or } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { grades, programTemplates, programTemplateVersions, schools, schoolYearTemplates, series, subjects, tracks } from '../drizzle/core-schema'
import { classes, classrooms, parents, students, users } from '../drizzle/school-schema'

export async function cleanupDatabase() {
  const db = getDb()

  try {
    // 1. Delete schools created during tests (name starts with 'TEST__')
    await db.delete(schools).where(ilike(schools.name, 'TEST__%'))

    // 2. Delete parents created during tests (identifiable by TEST__ prefix or @test.com email)
    await db.delete(parents).where(
      or(
        ilike(parents.email, '%@test.com'),
        ilike(parents.lastName, 'TEST__%'),
        ilike(parents.email, 'TEST__%'),
      )!,
    )

    // 3. Delete users created during tests
    await db.delete(users).where(
      or(
        ilike(users.email, '%@test.com'),
        ilike(users.email, 'TEST__%'),
      )!,
    )

    // 4. Delete students, classrooms, classes created during tests (via cascade or explicit if needed)
    // Most should be deleted if the school is deleted, but we can be explicit
    await db.delete(students).where(ilike(students.lastName, 'TEST__%'))
    await db.delete(classrooms).where(ilike(classrooms.name, 'TEST__%'))
    await db.delete(classes).where(ilike(classes.section, 'TEST__%'))

    // 5. Delete core entities created during tests
    // Strategy: Delete ANY program template that references our TEST__ entities, regardless of its own name.
    // This catches "zombie" data from previous runs where prefixing was missed.

    // Find all IDs of entities we are about to delete
    const testGradeIds = await db.select({ id: grades.id }).from(grades).where(or(ilike(grades.name, 'TEST__%'), ilike(grades.code, 'TEST__%'))!).then(rows => rows.map(r => r.id))
    const testSubjectIds = await db.select({ id: subjects.id }).from(subjects).where(or(ilike(subjects.name, 'TEST__%'), ilike(subjects.shortName, 'TEST__%'))!).then(rows => rows.map(r => r.id))
    const testSchoolYearIds = await db.select({ id: schoolYearTemplates.id }).from(schoolYearTemplates).where(ilike(schoolYearTemplates.name, 'TEST__%')).then(rows => rows.map(r => r.id))

    const orphanProgramConditions = []
    if (testGradeIds.length > 0)
      orphanProgramConditions.push(inArray(programTemplates.gradeId, testGradeIds))
    if (testSubjectIds.length > 0)
      orphanProgramConditions.push(inArray(programTemplates.subjectId, testSubjectIds))
    if (testSchoolYearIds.length > 0)
      orphanProgramConditions.push(inArray(programTemplates.schoolYearTemplateId, testSchoolYearIds))

    // Also include explicit TEST__ named programs
    orphanProgramConditions.push(ilike(programTemplates.name, 'TEST__%'))

    // Find programs to delete
    const programsToDelete = await db.select({ id: programTemplates.id }).from(programTemplates).where(or(...orphanProgramConditions))

    if (programsToDelete.length > 0) {
      const pIds = programsToDelete.map(p => p.id)
      // Delete versions first
      await db.delete(programTemplateVersions).where(inArray(programTemplateVersions.programTemplateId, pIds))
      // Delete programs
      await db.delete(programTemplates).where(inArray(programTemplates.id, pIds))
    }

    await db.delete(grades).where(or(ilike(grades.name, 'TEST__%'), ilike(grades.code, 'TEST__%'))!)
    await db.delete(series).where(or(ilike(series.name, 'TEST__%'), ilike(series.code, 'TEST__%'))!)
    await db.delete(subjects).where(or(ilike(subjects.name, 'TEST__%'), ilike(subjects.shortName, 'TEST__%'))!)
    await db.delete(tracks).where(or(ilike(tracks.name, 'TEST__%'), ilike(tracks.code, 'TEST__%'))!)
    await db.delete(schoolYearTemplates).where(ilike(schoolYearTemplates.name, 'TEST__%'))
  }
  catch (error) {
    // Suppress errors during cleanup but log them for debugging
    console.warn('Targeted cleanup encountered an issue:', error)
  }
}
