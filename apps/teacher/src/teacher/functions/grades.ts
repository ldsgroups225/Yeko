import { Result as R } from '@praha/byethrow'
import { and, eq, getDb } from '@repo/data-ops/database/setup'
import { classes } from '@repo/data-ops/drizzle/school-schema'
import {
  getCurrentTermForSchoolYear,
  submitStudentGrades,
} from '@repo/data-ops/queries/teacher-app'
import { createServerFn } from '@tanstack/react-start'

import { z } from 'zod'
import { getTeacherContext } from '../middleware/teacher-context'

const submitGradesSchema = z.object({
  teacherId: z.string(),
  schoolId: z.string(),
  schoolYearId: z.string(),
  classId: z.string(),
  subjectId: z.string(),
  gradeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  grades: z.array(
    z.object({
      studentId: z.string(),
      grade: z.number().min(0).max(100),
    }),
  ),
  weight: z.number().int().min(1).max(10).optional(),
  maxPoints: z.number().int().min(1).max(100).optional(),
  description: z.string().max(200).optional(),
  status: z.enum(['draft', 'submitted']),
  gradeType: z.enum(['quiz', 'test', 'exam', 'participation', 'homework', 'project']).optional(),
})

export const submitGrades = createServerFn({ method: 'POST' })
  .inputValidator(submitGradesSchema)
  .handler(async ({ data }) => {
    const ctx = await getTeacherContext()
    if (!ctx) {
      return { success: false, error: 'UNAUTHORIZED' }
    }

    if (data.teacherId !== ctx.teacherId || data.schoolId !== ctx.schoolId) {
      return { success: false, error: 'PERMISSION_DENIED' }
    }

    let schoolYearId = data.schoolYearId.trim()

    // Backward compatibility: old local drafts may not have schoolYearId persisted.
    if (!schoolYearId) {
      const db = getDb()
      const classRecord = await db
        .select({ schoolYearId: classes.schoolYearId })
        .from(classes)
        .where(
          and(
            eq(classes.id, data.classId),
            eq(classes.schoolId, data.schoolId),
          ),
        )
        .limit(1)

      schoolYearId = classRecord[0]?.schoolYearId ?? ''
    }

    if (!schoolYearId) {
      return { success: false, error: 'No school year found for class' }
    }

    // Get current term for the school year
    const currentTermResult = await getCurrentTermForSchoolYear(schoolYearId)

    if (R.isFailure(currentTermResult) || !currentTermResult.value) {
      return { success: false, error: 'No term found for current school year' }
    }

    const currentTerm = currentTermResult.value

    const result = await submitStudentGrades({
      teacherId: data.teacherId,
      schoolId: data.schoolId,
      classId: data.classId,
      subjectId: data.subjectId,
      termId: currentTerm.id,
      grades: data.grades,
      status: data.status,
      gradeType: data.gradeType,
      weight: data.weight,
      maxPoints: data.maxPoints,
      description: data.description,
      gradeDate: data.gradeDate,
    })

    if (R.isFailure(result)) {
      return {
        success: false,
        error: result.error.message,
        code: result.error.details?.code as string | undefined,
      }
    }

    return { success: true }
  })
