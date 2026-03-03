import type { EnrollmentFilters, EnrollmentStatistics, EnrollmentWithDetails } from './types'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, desc, eq, sql } from 'drizzle-orm'
import { getDb } from '../../database/setup'
import { grades, series } from '../../drizzle/core-schema'
import { classes, enrollments, schoolYears, students, users } from '../../drizzle/school-schema'
import { DatabaseError, dbError } from '../../errors'

// ==================== Queries ====================
export async function getEnrollments(filters: EnrollmentFilters): R.ResultAsync<{
  data: EnrollmentWithDetails[]
  total: number
  page: number
  totalPages: number
}, DatabaseError> {
  const db = getDb()
  const { schoolId, schoolYearId, classId, status, search, page = 1, limit = 20 } = filters

  return R.pipe(
    R.try({
      try: async () => {
        const conditions = []
        if (schoolYearId) {
          conditions.push(eq(enrollments.schoolYearId, schoolYearId))
        }
        if (classId) {
          conditions.push(eq(enrollments.classId, classId))
        }
        if (status) {
          conditions.push(eq(enrollments.status, status))
        }
        if (search) {
          conditions.push(
            sql`(${students.firstName} ILIKE ${`%${search}%`} OR ${students.lastName} ILIKE ${`%${search}%`} OR ${students.matricule} ILIKE ${`%${search}%`})`,
          )
        }

        const offset = (page - 1) * limit
        const rows = await db
          .select({
            enrollment: enrollments,
            student: {
              id: students.id,
              firstName: students.firstName,
              lastName: students.lastName,
              matricule: students.matricule,
              photoUrl: students.photoUrl,
              gender: students.gender,
            },
            class: {
              id: classes.id,
              section: classes.section,
              gradeName: grades.name,
              seriesName: series.name,
            },
            confirmedByUser: {
              id: users.id,
              name: users.name,
            },
            totalCount: sql<number>`COUNT(*) OVER()`.as('total_count'),
          })
          .from(enrollments)
          .innerJoin(students, eq(enrollments.studentId, students.id))
          .innerJoin(classes, eq(enrollments.classId, classes.id))
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .leftJoin(series, eq(classes.seriesId, series.id))
          .leftJoin(users, eq(enrollments.confirmedBy, users.id))
          .where(and(eq(students.schoolId, schoolId), ...conditions))
          .orderBy(desc(enrollments.enrollmentDate))
          .limit(limit)
          .offset(offset)

        const total = Number(rows[0]?.totalCount || 0)
        const data = rows.map(({ totalCount: _totalCount, ...rest }) => rest) as unknown as EnrollmentWithDetails[]
        return {
          data,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch enrollments'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId: filters.schoolId })),
  )
}

export async function getEnrollmentById(id: string): R.ResultAsync<EnrollmentWithDetails | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [enrollment] = await db
          .select({
            enrollment: enrollments,
            student: students,
            class: {
              id: classes.id,
              section: classes.section,
              gradeName: grades.name,
              seriesName: series.name,
              maxStudents: classes.maxStudents,
            },
            schoolYear: schoolYears,
            confirmedByUser: users,
          })
          .from(enrollments)
          .innerJoin(students, eq(enrollments.studentId, students.id))
          .innerJoin(classes, eq(enrollments.classId, classes.id))
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .leftJoin(series, eq(classes.seriesId, series.id))
          .innerJoin(schoolYears, eq(enrollments.schoolYearId, schoolYears.id))
          .leftJoin(users, eq(enrollments.confirmedBy, users.id))
          .where(eq(enrollments.id, id))

        if (!enrollment) {
          throw dbError('NOT_FOUND', `Enrollment with ID ${id} not found`)
        }
        return enrollment as unknown as EnrollmentWithDetails
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch enrollment'),
    }),
    R.mapError(tapLogErr(databaseLogger, { enrollmentId: id })),
  )
}

// ==================== Statistics ====================
export async function getEnrollmentStatistics(schoolId: string, schoolYearId: string): R.ResultAsync<EnrollmentStatistics, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        // Execute all stats queries in parallel
        const [
          byStatus,
          byGrade,
          byClass,
          trends,
        ] = await Promise.all([
          // Enrollments by status
          db
            .select({
              status: enrollments.status,
              count: sql<number>`COUNT(*)`.as('count'),
            })
            .from(enrollments)
            .innerJoin(students, eq(enrollments.studentId, students.id))
            .where(and(eq(students.schoolId, schoolId), eq(enrollments.schoolYearId, schoolYearId)))
            .groupBy(enrollments.status),

          // Enrollments by grade
          db
            .select({
              gradeId: grades.id,
              gradeName: grades.name,
              gradeOrder: grades.order,
              count: sql<number>`COUNT(*)`.as('count'),
              boys: sql<number>`COUNT(CASE WHEN ${students.gender} = 'M' THEN 1 END)`.as('boys'),
              girls: sql<number>`COUNT(CASE WHEN ${students.gender} = 'F' THEN 1 END)`.as('girls'),
            })
            .from(enrollments)
            .innerJoin(students, eq(enrollments.studentId, students.id))
            .innerJoin(classes, eq(enrollments.classId, classes.id))
            .innerJoin(grades, eq(classes.gradeId, grades.id))
            .where(
              and(
                eq(students.schoolId, schoolId),
                eq(enrollments.schoolYearId, schoolYearId),
                eq(enrollments.status, 'confirmed'),
              ),
            )
            .groupBy(grades.id, grades.name, grades.order)
            .orderBy(grades.order),

          // Enrollments by class
          db
            .select({
              classId: classes.id,
              className: sql<string>`CONCAT(${grades.name}, ' ', ${classes.section})`.as('class_name'),
              maxStudents: classes.maxStudents,
              count: sql<number>`COUNT(*)`.as('count'),
              boys: sql<number>`COUNT(CASE WHEN ${students.gender} = 'M' THEN 1 END)`.as('boys'),
              girls: sql<number>`COUNT(CASE WHEN ${students.gender} = 'F' THEN 1 END)`.as('girls'),
            })
            .from(enrollments)
            .innerJoin(students, eq(enrollments.studentId, students.id))
            .innerJoin(classes, eq(enrollments.classId, classes.id))
            .innerJoin(grades, eq(classes.gradeId, grades.id))
            .where(
              and(
                eq(students.schoolId, schoolId),
                eq(enrollments.schoolYearId, schoolYearId),
                eq(enrollments.status, 'confirmed'),
              ),
            )
            .groupBy(classes.id, grades.name, classes.section, classes.maxStudents, grades.order)
            .orderBy(grades.order, classes.section),

          // Enrollment trends (last 30 days)
          db
            .select({
              date: sql<string>`DATE(${enrollments.enrollmentDate})`.as('date'),
              count: sql<number>`COUNT(*)`.as('count'),
            })
            .from(enrollments)
            .innerJoin(students, eq(enrollments.studentId, students.id))
            .where(
              and(
                eq(students.schoolId, schoolId),
                eq(enrollments.schoolYearId, schoolYearId),
                sql`${enrollments.enrollmentDate} >= CURRENT_DATE - INTERVAL '30 days'`,
              ),
            )
            .groupBy(sql`DATE(${enrollments.enrollmentDate})`)
            .orderBy(sql`DATE(${enrollments.enrollmentDate})`),
        ])

        return {
          byStatus: byStatus as Array<{ status: any, count: number }>,
          byGrade: byGrade as Array<{ gradeId: string, gradeName: string, gradeOrder: number, count: number, boys: number, girls: number }>,
          byClass: byClass as Array<{ classId: string, className: string, maxStudents: number, count: number, boys: number, girls: number }>,
          trends: trends as Array<{ date: string, count: number }>,
          total: byStatus.reduce((sum: number, s: { count: number }) => sum + Number(s.count), 0),
          confirmed: Number(byStatus.find((s: { status: string }) => s.status === 'confirmed')?.count || 0),
          pending: Number(byStatus.find((s: { status: string }) => s.status === 'pending')?.count || 0),
        } as unknown as EnrollmentStatistics
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch enrollment statistics'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, schoolYearId })),
  )
}
