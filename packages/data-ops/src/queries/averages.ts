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
import { getEffectiveCoefficient } from './school-coefficients'

/**
 * Calculate Subject Average for a Student
 *
 * Formula: Σ(grade × weight) / Σ(weight)
 * Only includes validated grades
 */
export async function calculateSubjectAverage(params: {
  studentId: string
  subjectId: string
  termId: string
}) {
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
}

/**
 * Calculate Term Average for a Student
 *
 * Formula: Σ(subject_avg × coefficient) / Σ(coefficient)
 */
export async function calculateTermAverage(params: {
  studentId: string
  termId: string
  classId: string
}) {
  const db = getDb()

  // 1. Get class info
  const classInfo = await db.query.classes.findFirst({
    where: eq(classes.id, params.classId),
    with: {
      schoolYear: true,
    },
  })

  if (!classInfo)
    throw new Error('Class not found')

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
    const coefficientData = await getEffectiveCoefficient({
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
}

/**
 * Calculate Class Rankings
 */
export async function calculateClassRankings(params: {
  classId: string
  termId: string
}) {
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
}
