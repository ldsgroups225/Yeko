import { R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { subjects, termTemplates } from '../drizzle/core-schema'
import { studentGrades, students, terms } from '../drizzle/school-schema'
import { DatabaseError } from '../errors'

export interface SubjectPerformance {
  subjectId: string
  subjectName: string
  grades: Array<{
    id: string
    value: string
    type: string
    weight: number
    description: string | null
    gradeDate: string
  }>
  average: number | null
}

export interface StudentPerformanceData {
  termId: string | null
  termName: string | null
  subjects: SubjectPerformance[]
  overallAverage: number | null
}

export async function getStudentPerformanceStats(
  studentId: string,
  schoolId: string,
): R.ResultAsync<StudentPerformanceData, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        // Fetch all grades for the student
        const gradesResult = await db
          .select({
            id: studentGrades.id,
            value: studentGrades.value,
            type: studentGrades.type,
            weight: studentGrades.weight,
            description: studentGrades.description,
            gradeDate: studentGrades.gradeDate,
            subjectId: studentGrades.subjectId,
            subjectName: subjects.name,
            termId: studentGrades.termId,
            termName: termTemplates.name,
          })
          .from(studentGrades)
          .innerJoin(students, eq(studentGrades.studentId, students.id))
          .innerJoin(subjects, eq(studentGrades.subjectId, subjects.id))
          .innerJoin(terms, eq(studentGrades.termId, terms.id))
          .innerJoin(termTemplates, eq(terms.termTemplateId, termTemplates.id))
          .where(
            and(
              eq(studentGrades.studentId, studentId),
              eq(students.schoolId, schoolId),
              eq(studentGrades.status, 'validated'),
            ),
          )
          .orderBy(desc(studentGrades.gradeDate))

        if (gradesResult.length === 0) {
          return {
            termId: null,
            termName: null,
            subjects: [],
            overallAverage: null,
          }
        }

        // Determine current term (using the most recent grade's term as fallback)
        const currentTermId = gradesResult[0]?.termId || null
        const currentTermName = gradesResult[0]?.termName || null

        // Group by subject
        const subjectMap = new Map<string, SubjectPerformance>()

        let totalWeightedSum = 0
        let totalWeights = 0

        for (const grade of gradesResult) {
          if (!subjectMap.has(grade.subjectId)) {
            subjectMap.set(grade.subjectId, {
              subjectId: grade.subjectId,
              subjectName: grade.subjectName,
              grades: [],
              average: null,
            })
          }

          const subject = subjectMap.get(grade.subjectId)!
          subject.grades.push({
            id: grade.id,
            value: grade.value,
            type: grade.type,
            weight: grade.weight,
            description: grade.description,
            gradeDate: grade.gradeDate,
          })
        }

        // Calculate averages per subject
        for (const subject of subjectMap.values()) {
          let subjectSum = 0
          let subjectWeight = 0

          for (const g of subject.grades) {
            const val = Number.parseFloat(g.value)
            if (!Number.isNaN(val)) {
              subjectSum += val * g.weight
              subjectWeight += g.weight
            }
          }

          if (subjectWeight > 0) {
            subject.average = subjectSum / subjectWeight
            totalWeightedSum += subjectSum
            totalWeights += subjectWeight
          }
        }

        return {
          termId: currentTermId,
          termName: currentTermName,
          subjects: Array.from(subjectMap.values()),
          overallAverage:
            totalWeights > 0 ? totalWeightedSum / totalWeights : null,
        }
      },
      catch: err =>
        DatabaseError.from(
          err,
          'INTERNAL_ERROR',
          'Failed to fetch student performance stats',
        ),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId, schoolId })),
  )
}
