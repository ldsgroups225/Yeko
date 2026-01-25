import type { BloodType, Gender, StudentInsert, StudentStatus } from '../drizzle/school-schema'
import crypto from 'node:crypto'
import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm'
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

const nanoid = () => crypto.randomUUID()

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
}

// ==================== Queries ====================

export async function getStudents(filters: StudentFilters) {
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

  // Build query with joins for class/enrollment info
  const query = db
    .select({
      student: students,
      currentClass: {
        id: classes.id,
        section: classes.section,
        gradeName: grades.name,
        seriesName: series.name,
      },
      parentsCount: sql<number>`COUNT(DISTINCT ${studentParents.id})`.as('parents_count'),
      enrollmentStatus: enrollments.status,
    })
    .from(students)
    .leftJoin(
      enrollments,
      and(eq(enrollments.studentId, students.id), eq(enrollments.status, 'confirmed')),
    )
    .leftJoin(classes, eq(enrollments.classId, classes.id))
    .leftJoin(grades, eq(classes.gradeId, grades.id))
    .leftJoin(series, eq(classes.seriesId, series.id))
    .leftJoin(studentParents, eq(studentParents.studentId, students.id))
    .where(and(...conditions))
    .groupBy(students.id, classes.id, grades.id, series.id, enrollments.status)

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

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${students.id})` })
    .from(students)
    .where(and(...conditions))

  const total = Number(countResult[0]?.count || 0)
  const totalPages = Math.ceil(total / limit)
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

  const data = await query.orderBy(orderFn(sortColumn)).limit(limit).offset(offset)

  return { data, total, page, totalPages }
}

export async function getStudentById(id: string) {
  const db = getDb()
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
    return null

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
    ...student,
    parents: studentParentsList,
    enrollmentHistory,
  }
}

// ==================== Matricule Generation ====================

export async function generateMatricule(schoolId: string, schoolYearId: string): Promise<string> {
  const db = getDb()

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
      id: nanoid(),
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
}

// ==================== CRUD Operations ====================

export async function createStudent(data: CreateStudentInput) {
  const db = getDb()
  const { schoolId, schoolYearId, ...studentData } = data

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
        throw new Error('No active school year found. Please select a school year.')
      }
      yearId = activeYear.id
    }

    matricule = await generateMatricule(schoolId, yearId)
  }

  // Validate unique matricule
  const [existing] = await db
    .select()
    .from(students)
    .where(and(eq(students.schoolId, schoolId), eq(students.matricule, matricule)))

  if (existing) {
    throw new Error(`Matricule ${matricule} already exists`)
  }

  // Validate age (optional - based on school settings)
  if (data.dob) {
    const age = calculateAge(new Date(data.dob))
    if (age < 3 || age > 30) {
      throw new Error('Student age must be between 3 and 30 years')
    }
  }

  const [student] = await db
    .insert(students)
    .values({
      id: nanoid(),
      schoolId,
      ...studentData,
      matricule,
      admissionDate: data.admissionDate || new Date().toISOString().split('T')[0],
    } as StudentInsert)
    .returning()

  return student
}

export async function updateStudent(id: string, data: Partial<CreateStudentInput>) {
  const db = getDb()
  const [student] = await db
    .update(students)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(students.id, id))
    .returning()

  return student
}

export async function deleteStudent(id: string) {
  const db = getDb()
  // Check for active enrollments
  const [activeEnrollment] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.studentId, id), eq(enrollments.status, 'confirmed')))

  if (activeEnrollment) {
    throw new Error('Cannot delete student with active enrollment. Cancel enrollment first.')
  }

  await db.delete(students).where(eq(students.id, id))
}

// ==================== Status Management ====================

export async function updateStudentStatus(
  id: string,
  status: StudentStatus,
  reason?: string,
) {
  const db = getDb()
  const updates: Record<string, any> = { status, updatedAt: new Date() }

  switch (status) {
    case 'graduated':
      updates.graduationDate = new Date().toISOString().split('T')[0]
      break
    case 'transferred':
      updates.transferDate = new Date().toISOString().split('T')[0]
      updates.transferReason = reason
      break
    case 'withdrawn':
      updates.withdrawalDate = new Date().toISOString().split('T')[0]
      updates.withdrawalReason = reason
      break
  }

  const [student] = await db.update(students).set(updates).where(eq(students.id, id)).returning()

  // Cancel active enrollments if not active
  if (status !== 'active') {
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
}

// ==================== Bulk Operations ====================

export async function bulkImportStudents(
  schoolId: string,
  studentsData: CreateStudentInput[],
): Promise<{ success: number, errors: Array<{ row: number, error: string }> }> {
  const db = getDb()
  const results = { success: 0, errors: [] as Array<{ row: number, error: string }> }

  // Get active school year
  const [activeYear] = await db
    .select()
    .from(schoolYears)
    .where(and(eq(schoolYears.schoolId, schoolId), eq(schoolYears.isActive, true)))

  if (!activeYear) {
    throw new Error('No active school year found')
  }

  for (let i = 0; i < studentsData.length; i++) {
    try {
      const studentData = studentsData[i]
      if (!studentData)
        continue

      // Generate matricule if not provided
      let matricule = studentData.matricule
      if (!matricule) {
        matricule = await generateMatricule(schoolId, activeYear.id)
      }

      await createStudent({ ...studentData, schoolId, matricule })
      results.success++
    }
    catch (error) {
      results.errors.push({
        row: i + 1,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return results
}

export async function exportStudents(filters: StudentFilters) {
  const { data } = await getStudents({ ...filters, limit: 10000 })

  return data.map((item: { student: any, currentClass: any }) => ({
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
  }))
}

// ==================== Statistics ====================

export async function getStudentStatistics(schoolId: string) {
  const db = getDb()
  const conditions = [eq(students.schoolId, schoolId)]

  // Total students by status
  const statusCounts = await db
    .select({
      status: students.status,
      count: sql<number>`COUNT(*)`.as('count'),
    })
    .from(students)
    .where(and(...conditions))
    .groupBy(students.status)

  // Gender distribution
  const genderCounts = await db
    .select({
      gender: students.gender,
      count: sql<number>`COUNT(*)`.as('count'),
    })
    .from(students)
    .where(and(...conditions, eq(students.status, 'active')))
    .groupBy(students.gender)

  // Age distribution
  const ageCounts = await db
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
    .groupBy(sql`age_group`)

  // New admissions this year
  const currentYear = new Date().getFullYear()
  const newAdmissions = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(students)
    .where(
      and(...conditions, sql`EXTRACT(YEAR FROM ${students.admissionDate}::date) = ${currentYear}`),
    )

  return {
    byStatus: statusCounts,
    byGender: genderCounts,
    byAge: ageCounts,
    newAdmissions: Number(newAdmissions[0]?.count || 0),
    total: statusCounts.reduce((sum: number, s: { count: number }) => sum + Number(s.count), 0),
  }
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

export async function getActiveSchoolYear(schoolId: string) {
  const db = getDb()
  const [activeYear] = await db
    .select()
    .from(schoolYears)
    .where(and(eq(schoolYears.schoolId, schoolId), eq(schoolYears.isActive, true)))

  return activeYear
}
