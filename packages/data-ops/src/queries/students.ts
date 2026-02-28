import type { BloodType, EnrollmentStatus, Gender, Relationship, StudentInsert, StudentStatus } from '../drizzle/school-schema'
import crypto from 'node:crypto'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, desc, eq, gt, ilike, or, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { grades, schools, series } from '../drizzle/core-schema'
import {
  classes,
  enrollments,
  matriculeSequences,
  parents,
  schoolYears,
  studentParents,
  students,
} from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

// ==================== Types ====================

export interface StudentFilters {
  schoolId: string
  classId?: string
  gradeId?: string
  schoolYearId?: string
  status?: StudentStatus
  gender?: Gender
  search?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'matricule' | 'dob' | 'enrollmentDate' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateStudentInput {
  schoolId: string
  schoolYearId?: string // Optional - used for matricule generation
  firstName: string
  lastName: string
  dob: string
  gender?: Gender
  photoUrl?: string
  matricule?: string
  birthPlace?: string
  nationality?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  bloodType?: BloodType
  medicalNotes?: string
  previousSchool?: string
  admissionDate?: string
  status?: StudentStatus
}

export interface StudentWithDetails {
  student: typeof students.$inferSelect
  currentClass: {
    id: string
    section: string | null
    gradeName: string | null
    seriesName: string | null
  } | null
  parentsCount: number
  enrollmentStatus: EnrollmentStatus | null
}

export type StudentFullProfile = typeof students.$inferSelect & {
  parents: Array<{
    parent: typeof parents.$inferSelect
    relationship: Relationship | null
    isPrimary: boolean | null
    canPickup: boolean | null
    receiveNotifications: boolean | null
  }>
  enrollmentHistory: Array<{
    enrollment: typeof enrollments.$inferSelect
    class: {
      id: string
      section: string
      gradeName: string
      seriesName: string | null
    }
  }>
}

export interface StudentStatistics {
  byStatus: Array<{ status: StudentStatus | null, count: number }>
  byGender: Array<{ gender: Gender | null, count: number }>
  byAge: Array<{ ageGroup: string, count: number }>
  newAdmissions: number
  total: number
}

export interface ExportStudentRow {
  matricule: string | null
  lastName: string
  firstName: string
  dateOfBirth: string | null
  gender: string | null
  status: string
  class: string
  series: string
  nationality: string | null
  address: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  admissionDate: string | null
}

export interface ImportStudentResult {
  success: number
  errors: Array<{ row: number, error: string }>
}

// ==================== Queries ====================

export async function getStudents(filters: StudentFilters): R.ResultAsync<{
  data: StudentWithDetails[]
  total: number
  page: number
  totalPages: number
}, DatabaseError> {
  const db = getDb()
  const {
    schoolId,
    classId,
    gradeId,
    schoolYearId,
    status,
    gender,
    search,
    page = 1,
    limit = 20,
    sortBy = 'name',
    sortOrder = 'asc',
  } = filters

  return R.pipe(
    R.try({
      try: async () => {
        const conditions = [eq(students.schoolId, schoolId)]

        if (status) {
          conditions.push(eq(students.status, status))
        }

        if (gender) {
          conditions.push(eq(students.gender, gender))
        }

        if (search) {
          conditions.push(
            or(
              ilike(students.firstName, `%${search}%`),
              ilike(students.lastName, `%${search}%`),
              ilike(students.matricule, `%${search}%`),
            )!,
          )
        }

        // Apply class/grade/year filters
        if (classId) {
          conditions.push(eq(enrollments.classId, classId))
        }
        if (gradeId) {
          conditions.push(eq(classes.gradeId, gradeId))
        }
        if (schoolYearId) {
          conditions.push(eq(enrollments.schoolYearId, schoolYearId))
        }

        const whereClause = and(...conditions)

        const offset = (page - 1) * limit

        // Apply sorting
        const orderFn = sortOrder === 'desc' ? desc : asc
        const sortColumn = {
          name: students.lastName,
          matricule: students.matricule,
          dob: students.dob,
          enrollmentDate: students.createdAt,
          createdAt: students.createdAt,
        }[sortBy]

        // Use subquery for parentsCount to avoid complex GROUP BY issues
        const parentsCountSubquery = sql<number>`(
        SELECT COUNT(*)::int FROM ${studentParents} 
        WHERE ${studentParents.studentId} = ${students.id}
      )`.as('parents_count')

        // Use window function for total count
        const totalCountExpr = sql<number>`COUNT(*) OVER()`.as('total_count')

        const rows = await db
          .select({
            student: students,
            currentClass: {
              id: classes.id,
              section: classes.section,
              gradeName: grades.name,
              seriesName: series.name,
            },
            parentsCount: parentsCountSubquery,
            enrollmentStatus: enrollments.status,
            totalCount: totalCountExpr,
          })
          .from(students)
          .leftJoin(
            enrollments,
            and(eq(enrollments.studentId, students.id), eq(enrollments.status, 'confirmed')),
          )
          .leftJoin(classes, eq(enrollments.classId, classes.id))
          .leftJoin(grades, eq(classes.gradeId, grades.id))
          .leftJoin(series, eq(classes.seriesId, series.id))
          .where(whereClause)
          .orderBy(orderFn(sortColumn))
          .limit(limit)
          .offset(offset)

        const total = Number(rows[0]?.totalCount || 0)
        const mappedData: StudentWithDetails[] = rows.map(({ totalCount: _totalCount, ...d }) => ({
          student: d.student,
          currentClass: d.currentClass.id
            ? {
                id: d.currentClass.id,
                section: d.currentClass.section,
                gradeName: d.currentClass.gradeName,
                seriesName: d.currentClass.seriesName,
              }
            : null,
          parentsCount: d.parentsCount ?? 0,
          enrollmentStatus: d.enrollmentStatus,
        }))

        return { data: mappedData, total, page, totalPages: Math.ceil(total / limit) }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId: filters.schoolId })),
  )
}

export async function getStudentById(id: string): R.ResultAsync<StudentFullProfile, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [student] = await db
          .select({
            student: students,
            currentEnrollment: {
              id: enrollments.id,
              classId: enrollments.classId,
              schoolYearId: enrollments.schoolYearId,
              status: enrollments.status,
              enrollmentDate: enrollments.enrollmentDate,
              rollNumber: enrollments.rollNumber,
            },
            currentClass: {
              id: classes.id,
              section: classes.section,
              gradeName: grades.name,
              seriesName: series.name,
            },
          })
          .from(students)
          .leftJoin(
            enrollments,
            and(eq(enrollments.studentId, students.id), eq(enrollments.status, 'confirmed')),
          )
          .leftJoin(classes, eq(enrollments.classId, classes.id))
          .leftJoin(grades, eq(classes.gradeId, grades.id))
          .leftJoin(series, eq(classes.seriesId, series.id))
          .where(eq(students.id, id))

        if (!student)
          throw dbError('NOT_FOUND', getNestedErrorMessage('students', 'notFoundWithId', { id }))

        // Get parents
        const studentParentsList = await db
          .select({
            parent: parents,
            relationship: studentParents.relationship,
            isPrimary: studentParents.isPrimary,
            canPickup: studentParents.canPickup,
            receiveNotifications: studentParents.receiveNotifications,
          })
          .from(studentParents)
          .innerJoin(parents, eq(studentParents.parentId, parents.id))
          .where(eq(studentParents.studentId, id))

        // Get enrollment history
        const enrollmentHistory = await db
          .select({
            enrollment: enrollments,
            class: {
              id: classes.id,
              section: classes.section,
              gradeName: grades.name,
              seriesName: series.name,
            },
          })
          .from(enrollments)
          .innerJoin(classes, eq(enrollments.classId, classes.id))
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .leftJoin(series, eq(classes.seriesId, series.id))
          .where(eq(enrollments.studentId, id))
          .orderBy(desc(enrollments.enrollmentDate))

        return {
          ...student.student,
          parents: studentParentsList,
          enrollmentHistory,
        }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'fetchByIdFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId: id })),
  )
}

export async function generateMatricule(schoolId: string, schoolYearId: string): R.ResultAsync<string, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        // Get or create sequence
        const [sequence] = await db
          .select()
          .from(matriculeSequences)
          .where(
            and(eq(matriculeSequences.schoolId, schoolId), eq(matriculeSequences.schoolYearId, schoolYearId)),
          )

        if (!sequence) {
          // Get school code for prefix
          const [school] = await db.select().from(schools).where(eq(schools.id, schoolId))
          const prefix = school?.code?.substring(0, 2).toUpperCase() || 'XX'

          // Get year from school year
          const [schoolYear] = await db.select().from(schoolYears).where(eq(schoolYears.id, schoolYearId))
          const year = new Date(schoolYear?.startDate || new Date()).getFullYear().toString().slice(-2)

          // Create new sequence
          await db.insert(matriculeSequences).values({
            id: crypto.randomUUID(),
            schoolId,
            schoolYearId,
            prefix,
            lastNumber: 1,
            format: `${prefix}${year}{sequence:4}`,
          })

          return `${prefix}${year}0001`
        }

        // Increment sequence
        const newNumber = sequence.lastNumber + 1
        await db
          .update(matriculeSequences)
          .set({ lastNumber: newNumber, updatedAt: new Date() })
          .where(eq(matriculeSequences.id, sequence.id))

        // Format matricule
        const paddedNumber = newNumber.toString().padStart(4, '0')
        const year = sequence.format.match(/\d{2}/)?.[0] || new Date().getFullYear().toString().slice(-2)

        return `${sequence.prefix}${year}${paddedNumber}`
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'generateMatriculeFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, schoolYearId })),
  )
}

// Reserve a range of matricule numbers atomically using UPSERT
export async function reserveMatriculeRange(
  schoolId: string,
  schoolYearId: string,
  count: number,
): R.ResultAsync<{ startNumber: number; matricules: string[] }, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        // Get school code for prefix
        const [school] = await db.select().from(schools).where(eq(schools.id, schoolId))
        const prefix = school?.code?.substring(0, 2).toUpperCase() || 'XX'

        // Get year from school year
        const [schoolYear] = await db.select().from(schoolYears).where(eq(schoolYears.id, schoolYearId))
        const year = new Date(schoolYear?.startDate || new Date()).getFullYear().toString().slice(-2)

        // Atomic UPSERT: increment and return new number in one operation
        const [updated] = await db
          .insert(matriculeSequences)
          .values({
            id: crypto.randomUUID(),
            schoolId,
            schoolYearId,
            prefix,
            lastNumber: count,
            format: `${prefix}${year}{sequence:4}`,
          })
          .onConflictDoUpdate(
            target: [matriculeSequences.schoolId, matriculeSequences.schoolYearId],
            set: {
              lastNumber: sql`GREATEST(${matriculeSequences.lastNumber}, ${count})`,
              updatedAt: new Date(),
            },
          )
          .returning({ lastNumber: matriculeSequences.lastNumber })

        const startNumber = (updated.lastNumber || 1) - count + 1

        // Generate matricule strings
        const matricules: string[] = []
        for (let i = 0; i < count; i++) {
          const num = startNumber + i
          const paddedNumber = num.toString().padStart(4, '0')
          matricules.push(`${prefix}${year}${paddedNumber}`)
        }

        return { startNumber, matricules }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'reserveMatriculeRangeFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, schoolYearId, count })),
  )
}

// ==================== CRUD Operations ====================

export async function createStudent(data: CreateStudentInput): R.ResultAsync<typeof students.$inferSelect, DatabaseError> {
  const db = getDb()
  const { schoolId, schoolYearId, ...studentData } = data

  return R.pipe(
    R.try({
      try: async () => {
        // Generate matricule if not provided
        let matricule = data.matricule
        if (!matricule) {
          // Use provided school year or fall back to active school year
          let yearId: string = schoolYearId || ''
          if (!yearId) {
            const [activeYear] = await db
              .select()
              .from(schoolYears)
              .where(and(eq(schoolYears.schoolId, schoolId), eq(schoolYears.isActive, true)))

            if (!activeYear) {
              throw dbError('VALIDATION_ERROR', getNestedErrorMessage('students', 'noActiveSchoolYear'))
            }
            yearId = activeYear.id
          }

          const matriculeResult = await generateMatricule(schoolId, yearId)
          if (R.isFailure(matriculeResult)) {
            throw matriculeResult.error
          }
          matricule = matriculeResult.value
        }

        // Validate unique matricule
        const [existing] = await db
          .select()
          .from(students)
          .where(and(eq(students.schoolId, schoolId), eq(students.matricule, matricule)))

        if (existing) {
          throw dbError('CONFLICT', getNestedErrorMessage('students', 'matriculeExistsWithId', { matricule }))
        }

        // Validate age (optional - based on school settings)
        if (data.dob) {
          const age = calculateAge(new Date(data.dob))
          if (age < 3 || age > 30) {
            throw dbError('VALIDATION_ERROR', getNestedErrorMessage('students', 'invalidAgeRange'))
          }
        }

        const [student] = await db
          .insert(students)
          .values({
            id: crypto.randomUUID(),
            schoolId,
            ...studentData,
            matricule,
            admissionDate: data.admissionDate || new Date().toISOString().split('T')[0],
          } as StudentInsert)
          .returning()

        if (!student)
          throw new DatabaseError('INTERNAL_ERROR', getNestedErrorMessage('students', 'createFailed'))

        return student
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'createFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId: data.schoolId })),
  )
}

export async function updateStudent(id: string, data: Partial<CreateStudentInput>): R.ResultAsync<typeof students.$inferSelect, DatabaseError> {
  const db = getDb()
  const { status } = data
  return R.pipe(
    R.try({
      try: async () => {
        const [student] = await db
          .update(students)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(students.id, id))
          .returning()

        if (!student) {
          throw new DatabaseError('NOT_FOUND', getNestedErrorMessage('students', 'notFound'))
        }

        // Cancel active enrollments if not active
        if (status && status !== 'active') {
          await db
            .update(enrollments)
            .set({
              status: 'cancelled',
              cancelledAt: new Date(),
              cancellationReason: `Student ${status}`,
              updatedAt: new Date(),
            })
            .where(and(eq(enrollments.studentId, id), eq(enrollments.status, 'confirmed')))
        }

        return student
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'updateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId: id, status })),
  )
}

export async function updateStudentStatus(id: string, status: StudentStatus, reason?: string): R.ResultAsync<typeof students.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [student] = await db
          .update(students)
          .set({
            status,
            withdrawalReason: reason,
            withdrawalDate: status === 'withdrawn' ? new Date().toISOString().split('T')[0] : null,
            updatedAt: new Date(),
          })
          .where(eq(students.id, id))
          .returning()

        if (!student) {
          throw new DatabaseError('NOT_FOUND', getNestedErrorMessage('students', 'notFound'))
        }

        // Handle enrollments
        if (status !== 'active') {
          await db
            .update(enrollments)
            .set({
              status: 'cancelled',
              cancelledAt: new Date(),
              cancellationReason: reason || `Student ${status}`,
              updatedAt: new Date(),
            })
            .where(and(eq(enrollments.studentId, id), eq(enrollments.status, 'confirmed')))
        }

        return student
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'updateStatusFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId: id, status })),
  )
}

export async function deleteStudent(id: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        // First check if student exists
        const [student] = await db.select().from(students).where(eq(students.id, id))
        if (!student) {
          throw new DatabaseError('NOT_FOUND', getNestedErrorMessage('students', 'notFound'))
        }

        // Hard delete for now - will cascade to related tables based on schema definition
        // If we implement soft delete later, this will change to an update
        await db.delete(students).where(eq(students.id, id))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'deleteFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId: id })),
  )
}

// ==================== Bulk Operations ====================

// Batch import students to minimize round-trips
export async function bulkImportStudents(
  schoolId: string,
  studentsData: Array<CreateStudentInput & { matricule?: string }>,
): R.ResultAsync<ImportStudentResult, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const results = { success: 0, errors: [] as Array<{ row: number, error: string }> }

        const [activeYear] = await db
          .select()
          .from(schoolYears)
          .where(and(eq(schoolYears.schoolId, schoolId), eq(schoolYears.isActive, true)))

        if (!activeYear) {
          throw new Error(getNestedErrorMessage('students', 'noActiveSchoolYear'))
        }

        // Filter out empty rows and separate custom matricules from auto-generated
        const validStudents = studentsData.filter(s => !!s?.firstName && !!s?.lastName)
        const studentsNeedingMatricule = validStudents.filter(s => !s.matricule)
        const studentsWithMatricule = validStudents.filter(s => s.matricule)

        // Reserve a range of matricules atomically (avoids race conditions)
        let matriculeStart = 1
        let reservedMatricules: string[] = []
        
        if (studentsNeedingMatricule.length > 0) {
          const reserveResult = await reserveMatriculeRange(schoolId, activeYear.id, studentsNeedingMatricule.length)
          if (R.isFailure(reserveResult)) {
            throw new Error(reserveResult.error.message)
          }
          matriculeStart = reserveResult.value.startNumber
          reservedMatricules = reserveResult.value.matricules
        }

        // Build students array with matricules
        let reservedIndex = 0
        const studentsToInsert = []
        
        for (const studentData of validStudents) {
          let matricule = studentData.matricule
          
          // Assign auto-generated matricule from reserved range
          if (!matricule && reservedIndex < reservedMatricules.length) {
            matricule = reservedMatricules[reservedIndex++]
          }

          studentsToInsert.push({
            id: crypto.randomUUID(),
            ...studentData,
            matricule,
            admissionDate: studentData.admissionDate || new Date().toISOString().split('T')[0],
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }

        if (studentsToInsert.length > 0) {
          const inserted = await db
            .insert(students)
            .values(studentsToInsert)
            .onConflictDoNothing({ target: [students.schoolId, students.matricule] })
            .returning()

          results.success = inserted?.length || 0

          // Report errors for those that weren't inserted (duplicates)
          const insertedMatricules = new Set(inserted?.map(s => s.matricule))
          studentsToInsert.forEach((s, idx) => {
            if (!insertedMatricules.has(s.matricule)) {
              results.errors.push({
                row: idx + 1,
                error: getNestedErrorMessage('students', 'matriculeExistsWithId', { matricule: s.matricule }),
              })
            }
          })
        }

        return results
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'bulkImportFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId })),
  )
}

export async function exportStudents(filters: StudentFilters): R.ResultAsync<ExportStudentRow[], DatabaseError> {
  const result = await getStudents({ ...filters, limit: 10000 })
  if (R.isFailure(result)) {
    return result
  }
  return {
    type: 'Success',
    value: result.value.data.map(item => ({
      matricule: item.student.matricule,
      lastName: item.student.lastName,
      firstName: item.student.firstName,
      dateOfBirth: item.student.dob,
      gender: item.student.gender,
      status: item.student.status,
      class: item.currentClass ? `${item.currentClass.gradeName} ${item.currentClass.section}` : '',
      series: item.currentClass?.seriesName || '',
      nationality: item.student.nationality,
      address: item.student.address,
      emergencyContact: item.student.emergencyContact,
      emergencyPhone: item.student.emergencyPhone,
      admissionDate: item.student.admissionDate,
    })),
  }
}

// ==================== Statistics ====================

export async function getStudentStatistics(schoolId: string): R.ResultAsync<StudentStatistics, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const conditions = [eq(students.schoolId, schoolId)]

        // New admissions this year
        const currentYear = new Date().getFullYear()
        const [
          statusCounts,
          genderCounts,
          ageCounts,
          [newAdmissionsResult],
        ] = await Promise.all([
          // Total students by status
          db
            .select({
              status: students.status,
              count: sql<number>`COUNT(*)`.as('count'),
            })
            .from(students)
            .where(and(...conditions))
            .groupBy(students.status),

          // Gender distribution
          db
            .select({
              gender: students.gender,
              count: sql<number>`COUNT(*)`.as('count'),
            })
            .from(students)
            .where(and(...conditions, eq(students.status, 'active')))
            .groupBy(students.gender),

          // Age distribution
          db
            .select({
              ageGroup: sql<string>`
            CASE 
              WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, ${students.dob}::date)) < 10 THEN 'Under 10'
              WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, ${students.dob}::date)) BETWEEN 10 AND 14 THEN '10-14'
              WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, ${students.dob}::date)) BETWEEN 15 AND 18 THEN '15-18'
              ELSE 'Over 18'
            END
          `.as('age_group'),
              count: sql<number>`COUNT(*)`.as('count'),
            })
            .from(students)
            .where(and(...conditions, eq(students.status, 'active')))
            .groupBy(sql`age_group`),

          // New admissions this year
          db
            .select({ count: sql<number>`COUNT(*)` })
            .from(students)
            .where(
              and(...conditions, sql`EXTRACT(YEAR FROM ${students.admissionDate}::date) = ${currentYear}`),
            ),
        ])

        const newAdmissions = newAdmissionsResult?.count ?? 0

        return {
          byStatus: statusCounts.map(s => ({ status: s.status, count: Number(s.count) })),
          byGender: genderCounts.map(g => ({ gender: g.gender, count: Number(g.count) })),
          byAge: ageCounts.map(a => ({ ageGroup: String(a.ageGroup), count: Number(a.count) })),
          newAdmissions: Number(newAdmissions),
          total: statusCounts.reduce((sum: number, s) => sum + Number(s.count), 0),
        }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'fetchStatsFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId })),
  )
}

// ==================== Helper Functions ====================

function calculateAge(dob: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}
