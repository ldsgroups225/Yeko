import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import {
  and,
  desc,
  eq,
  isNotNull,
  isNull,
  sql,
} from 'drizzle-orm'
import { getDb } from '../database/setup'
import {
  classes,
  studentAverages,
  studentGrades,
} from '../drizzle/school-schema'
import { DatabaseError } from '../errors'
import * as coefficientQueries from './school-coefficients'

/**
 * Calculate Subject Average for a Student
 *
 * Formula: Σ(grade × weight) / Σ(weight)
 * Only includes validated grades
 */
export function calculateSubjectAverage(params: {
  studentId: string
  subjectId: string
  termId: string
}) {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()
        const [result] = await db.select({
          weightedSum: sql<number>`sum(${studentGrades.value} * ${studentGrades.weight})`,
          totalWeight: sql<number>`sum(${studentGrades.weight})`,
          gradeCount: sql<number>`count(*)`,
        })
          .from(studentGrades)
          .where(and(
            eq(studentGrades.studentId, params.studentId),
            eq(studentGrades.subjectId, params.subjectId),
            eq(studentGrades.termId, params.termId),
            eq(studentGrades.status, 'validated'),
          ))

        if (!result || !result.totalWeight || result.totalWeight === 0) {
          return { average: 0, gradeCount: 0 }
        }

        // Ensure weightedSum is treated as number
        const weightedSum = Number(result.weightedSum)
        const totalWeight = Number(result.totalWeight)

        const average = Number((weightedSum / totalWeight).toFixed(2))

        return {
          average,
          gradeCount: result.gradeCount,
        }
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { ...params, action: 'Calculating subject average' })),
  )
}

/**
 * Calculate Term Average for a Student
 *
 * Formula: Σ(subject_avg × coefficient) / Σ(coefficient)
 */
export function calculateTermAverage(params: {
  studentId: string
  termId: string
  classId: string
}) {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()

        // 1. Get class info
        const classInfo = await db.query.classes.findFirst({
          where: eq(classes.id, params.classId),
          with: {
            schoolYear: true,
          },
        })

        if (!classInfo)
          throw new DatabaseError('NOT_FOUND', 'Class not found')

        // 2. Get all subject averages for the student
        const subjectAveragesList = await db.query.studentAverages.findMany({
          where: and(
            eq(studentAverages.studentId, params.studentId),
            eq(studentAverages.termId, params.termId),
            isNotNull(studentAverages.subjectId),
          ),
        })

        // 3. Get coefficients
        let totalWeightedSum = 0
        let totalCoefficients = 0
        let simpleSum = 0

        for (const subjectAvg of subjectAveragesList) {
          if (!subjectAvg.subjectId)
            continue

          // Get coefficient
          const coefficientData = await coefficientQueries.getEffectiveCoefficient({
            schoolId: classInfo.schoolId,
            subjectId: subjectAvg.subjectId,
            gradeId: classInfo.gradeId,
            seriesId: classInfo.seriesId,
            schoolYearTemplateId: classInfo.schoolYear.schoolYearTemplateId,
          })

          const coef = coefficientData?.weight ?? 1
          const avgVal = Number(subjectAvg.average!)

          totalWeightedSum += avgVal * coef
          totalCoefficients += coef
          simpleSum += avgVal
        }

        const average = subjectAveragesList.length > 0
          ? Number((simpleSum / subjectAveragesList.length).toFixed(2))
          : 0

        const weightedAverage = totalCoefficients > 0
          ? Number((totalWeightedSum / totalCoefficients).toFixed(2))
          : 0

        return {
          average,
          weightedAverage,
          subjectCount: subjectAveragesList.length,
        }
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { ...params, action: 'Calculating term average' })),
  )
}

/**
 * Calculate Class Rankings
 */
export function calculateClassRankings(params: {
  classId: string
  termId: string
}) {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()
        // 1. Get all student averages for the class (overall, not per subject)
        const averages = await db.query.studentAverages.findMany({
          where: and(
            eq(studentAverages.classId, params.classId),
            eq(studentAverages.termId, params.termId),
            isNull(studentAverages.subjectId), // Overall average
          ),
          orderBy: desc(studentAverages.weightedAverage),
        })

        // 2. Calculate ranks with tie handling
        let currentRank = 1
        let previousAverage: string | null = null

        for (let i = 0; i < averages.length; i++) {
          const avg = averages[i]
          if (!avg) {
            continue
          }

          if (previousAverage !== null && avg.weightedAverage === previousAverage) {
            // keep currentRank same
          }
          else {
            currentRank = i + 1
          }

          await db.update(studentAverages)
            .set({ rankInClass: currentRank })
            .where(eq(studentAverages.id, avg.id))

          previousAverage = avg.weightedAverage
        }
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { ...params, action: 'Calculating class rankings' })),
  )
}

export function calculateAndStoreClassAverages(params: {
  classId: string
  termId: string
  schoolId: string
}) {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()

        // 1. Get Class Info
        const classInfo = await db.query.classes.findFirst({
          where: eq(classes.id, params.classId),
          with: {
            schoolYear: true,
            grade: true,
            series: true,
          },
        })
        if (!classInfo)
          throw new DatabaseError('NOT_FOUND', 'Class not found')

        // 2. Get Coefficients Map
        const coefficientsList = await coefficientQueries.getSchoolCoefficients({
          schoolId: params.schoolId,
          schoolYearTemplateId: classInfo.schoolYear.schoolYearTemplateId,
          gradeId: classInfo.gradeId ?? '', // Handle potential null if gradeId is optional in schema type, though usage implies required
          seriesId: classInfo.seriesId ?? null,
        })
        const coefMap = new Map(coefficientsList.map(c => [c.subjectId, c.effectiveWeight]))

        // 3. Get All Grades for Class/Term (validated only)
        const allGrades = await db.query.studentGrades.findMany({
          where: and(
            eq(studentGrades.classId, params.classId),
            eq(studentGrades.termId, params.termId),
            eq(studentGrades.status, 'validated'),
          ),
        })

        // 4. Group by Student -> Subject
        const studentGradesMap = new Map<string, Map<string, typeof allGrades>>()

        for (const g of allGrades) {
          if (!studentGradesMap.has(g.studentId)) {
            studentGradesMap.set(g.studentId, new Map())
          }
          const subjMap = studentGradesMap.get(g.studentId)!
          if (!subjMap.has(g.subjectId)) {
            subjMap.set(g.subjectId, [])
          }
          subjMap.get(g.subjectId)!.push(g)
        }

        // 5. Cleanup existing averages
        await db.delete(studentAverages).where(and(
          eq(studentAverages.classId, params.classId),
          eq(studentAverages.termId, params.termId),
        ))

        const subjectAveragesToInsert: any[] = []
        const termAveragesToInsert: any[] = []
        const now = new Date()

        for (const [studentId, subjectsMap] of studentGradesMap.entries()) {
          let totalWeightedSum = 0
          let totalCoefficients = 0
          let subjectCount = 0
          let simpleSum = 0

          for (const [subjectId, grades] of subjectsMap.entries()) {
            // Calculate Subject Average
            const sumWeighted = grades.reduce((acc, g) => acc + (Number(g.value) * g.weight), 0)
            const sumWeight = grades.reduce((acc, g) => acc + g.weight, 0)

            if (sumWeight === 0)
              continue

            const avg = Number((sumWeighted / sumWeight).toFixed(2))
            const coef = coefMap.get(subjectId) ?? 1

            // Add to bulk insert
            subjectAveragesToInsert.push({
              id: crypto.randomUUID(),
              studentId,
              classId: params.classId,
              termId: params.termId,
              subjectId, // IS NOT NULL
              average: avg.toString(),
              gradeCount: grades.length,
              rankInClass: null,
              calculatedAt: now,
              isFinal: false,
              weightedAverage: avg.toString(),
            })

            // Accumulate for Term Average
            totalWeightedSum += avg * coef
            totalCoefficients += coef
            simpleSum += avg
            subjectCount++
          }

          // Calculate Term Average
          const termAvg = totalCoefficients > 0
            ? Number((totalWeightedSum / totalCoefficients).toFixed(2))
            : 0

          const simpleAvg = subjectCount > 0
            ? Number((simpleSum / subjectCount).toFixed(2))
            : 0

          termAveragesToInsert.push({
            id: crypto.randomUUID(),
            studentId,
            classId: params.classId,
            termId: params.termId,
            subjectId: null, // IS NULL -> This is the TERM average
            average: simpleAvg.toString(),
            weightedAverage: termAvg.toString(),
            gradeCount: subjectCount,
            calculatedAt: now,
            isFinal: false,
          })
        }

        // Batch Insert
        if (subjectAveragesToInsert.length > 0) {
          await db.insert(studentAverages).values(subjectAveragesToInsert)
        }
        if (termAveragesToInsert.length > 0) {
          await db.insert(studentAverages).values(termAveragesToInsert)
        }

        // 6. Calculate Ranks
        const rankResult = await calculateClassRankings({ classId: params.classId, termId: params.termId })
        if (R.isFailure(rankResult))
          throw rankResult.error
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { ...params, action: 'Calculating and storing class averages' })),
  )
}

export function getClassAveragesList(classId: string, termId: string) {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()

        // Fetch Overalls
        const overallAverages = await db.query.studentAverages.findMany({
          where: and(
            eq(studentAverages.classId, classId),
            eq(studentAverages.termId, termId),
            isNull(studentAverages.subjectId),
          ),
          with: {
            student: {
              columns: {
                id: true,
                firstName: true,
                lastName: true,
                matricule: true,
              },
            },
          },
        })

        // Fetch Subject Averages for details
        const subjectAverages = await db.query.studentAverages.findMany({
          where: and(
            eq(studentAverages.classId, classId),
            eq(studentAverages.termId, termId),
            isNotNull(studentAverages.subjectId),
          ),
          with: {
            subject: true,
          },
        })

        // Get Coefficients for display
        const classInfo = await db.query.classes.findFirst({
          where: eq(classes.id, classId),
          with: { schoolYear: true, grade: true, series: true },
        })

        let coefMap = new Map<string, number>()
        if (classInfo) {
          const coefficientsList = await coefficientQueries.getSchoolCoefficients({
            schoolId: classInfo.schoolId,
            schoolYearTemplateId: classInfo.schoolYear.schoolYearTemplateId,
            gradeId: classInfo.gradeId ?? '',
            seriesId: classInfo.seriesId ?? null,
          })
          coefMap = new Map(coefficientsList.map(c => [c.subjectId, c.effectiveWeight]))
        }

        // Merge
        return overallAverages.map((overall) => {
          const studentSubjects = subjectAverages.filter(sa => sa.studentId === overall.studentId)
          const formattedGrades = studentSubjects.map(sa => ({
            value: Number(sa.average),
            max: 20, // Standard
            coefficient: coefMap.get(sa.subjectId!) ?? 1,
            gradeName: sa.subject?.name,
          }))

          return {
            studentId: overall.studentId,
            studentName: `${overall.student.lastName} ${overall.student.firstName}`,
            matricule: overall.student.matricule ?? '',
            average: Number(overall.weightedAverage), // Use weighted average as main
            weightedAverage: Number(overall.weightedAverage),
            rank: overall.rankInClass ?? 0,
            gradeCount: studentSubjects.length, // Number of subjects
            grades: formattedGrades,
          }
        })
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { classId, termId, action: 'Getting class averages list' })),
  )
}
