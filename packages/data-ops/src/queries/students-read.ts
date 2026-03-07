import type { StudentFilters, StudentFullProfile, StudentWithDetails } from './students-types'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { grades, series } from '../drizzle/core-schema'
import {
  classes,
  enrollments,
  parents,
  studentParents,
  students,
} from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

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
        if (status)
          conditions.push(eq(students.status, status))
        if (gender)
          conditions.push(eq(students.gender, gender))
        if (search) {
          conditions.push(or(ilike(students.firstName, `%${search}%`), ilike(students.lastName, `%${search}%`), ilike(students.matricule, `%${search}%`))!)
        }
        if (classId)
          conditions.push(eq(enrollments.classId, classId))
        if (gradeId)
          conditions.push(eq(classes.gradeId, gradeId))
        if (schoolYearId)
          conditions.push(eq(enrollments.schoolYearId, schoolYearId))

        const whereClause = and(...conditions)
        const offset = (page - 1) * limit
        const orderFn = sortOrder === 'desc' ? desc : asc
        const sortColumn = { name: students.lastName, matricule: students.matricule, dob: students.dob, enrollmentDate: students.createdAt, createdAt: students.createdAt }[sortBy]

        const parentsCountSubquery = sql<number>`(SELECT COUNT(*)::int FROM ${studentParents} WHERE ${studentParents.studentId} = ${students.id})`.as('parents_count')
        const totalCountExpr = sql<number>`COUNT(*) OVER()`.as('total_count')

        const rows = await db.select({
          student: students,
          currentClass: { id: classes.id, section: classes.section, gradeName: grades.name, seriesName: series.name },
          parentsCount: parentsCountSubquery,
          enrollmentStatus: enrollments.status,
          totalCount: totalCountExpr,
        })
          .from(students)
          .leftJoin(enrollments, and(eq(enrollments.studentId, students.id), eq(enrollments.status, 'confirmed')))
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
          currentClass: d.currentClass.id ? { id: d.currentClass.id, section: d.currentClass.section, gradeName: d.currentClass.gradeName, seriesName: d.currentClass.seriesName } : null,
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
        const [student] = await db.select({ student: students }).from(students).where(eq(students.id, id))
        if (!student)
          throw dbError('NOT_FOUND', getNestedErrorMessage('students', 'notFoundWithId', { id }))

        const [studentParentsList, enrollmentHistory] = await Promise.all([
          db.select({ parent: parents, relationship: studentParents.relationship, isPrimary: studentParents.isPrimary, canPickup: studentParents.canPickup, receiveNotifications: studentParents.receiveNotifications })
            .from(studentParents)
            .innerJoin(parents, eq(studentParents.parentId, parents.id))
            .where(eq(studentParents.studentId, id)),
          db.select({ enrollment: enrollments, class: { id: classes.id, section: classes.section, gradeName: grades.name, seriesName: series.name } })
            .from(enrollments)
            .innerJoin(classes, eq(enrollments.classId, classes.id))
            .innerJoin(grades, eq(classes.gradeId, grades.id))
            .leftJoin(series, eq(classes.seriesId, series.id))
            .where(eq(enrollments.studentId, id))
            .orderBy(desc(enrollments.enrollmentDate)),
        ])
        return { ...student.student, parents: studentParentsList, enrollmentHistory }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'fetchByIdFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId: id })),
  )
}

export async function getStudentByMatricule(schoolId: string, matricule: string): R.ResultAsync<typeof students.$inferSelect | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [student] = await db.select().from(students).where(and(eq(students.schoolId, schoolId), eq(students.matricule, matricule))).limit(1)
        return student || null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to fetch student with matricule ${matricule}`),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, matricule })),
  )
}
