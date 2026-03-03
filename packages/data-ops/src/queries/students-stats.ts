import type { StudentStatistics } from './students-types'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { students } from '../drizzle/school-schema'
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

export async function getStudentStatistics(schoolId: string): R.ResultAsync<StudentStatistics, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const conditions = [eq(students.schoolId, schoolId)]
        const currentYear = new Date().getFullYear()

        const [statusCounts, genderCounts, ageCounts, [newAdmissionsResult]] = await Promise.all([
          db.select({ status: students.status, count: sql<number>`COUNT(*)`.as('count') }).from(students).where(and(...conditions)).groupBy(students.status),
          db.select({ gender: students.gender, count: sql<number>`COUNT(*)`.as('count') }).from(students).where(and(...conditions, eq(students.status, 'active'))).groupBy(students.gender),
          db.select({
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
          db.select({ count: sql<number>`COUNT(*)` }).from(students).where(and(...conditions, sql`EXTRACT(YEAR FROM ${students.admissionDate}::date) = ${currentYear}`)),
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
