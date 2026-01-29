import {
  getCurrentTermForSchoolYear,
  submitStudentGrades,
} from '@repo/data-ops/queries/teacher-app'
import { createServerFn } from '@tanstack/react-start'

import { z } from 'zod'

const submitGradesSchema = z.object({
  teacherId: z.string(),
  schoolId: z.string(),
  schoolYearId: z.string(),
  classId: z.string(),
  subjectId: z.string(),
  grades: z.array(
    z.object({
      studentId: z.string(),
      grade: z.number().min(0).max(20),
    }),
  ),
  status: z.enum(['draft', 'submitted']),
  gradeType: z.enum(['quiz', 'test', 'exam', 'participation', 'homework', 'project']).optional(),
})

export const submitGrades = createServerFn({ method: 'POST' })
  .inputValidator(submitGradesSchema)
  .handler(async ({ data }) => {
    // Get current term for the school year
    const currentTermResult = await getCurrentTermForSchoolYear(data.schoolYearId)

    if (currentTermResult.isErr() || !currentTermResult.value) {
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
    })

    if (result.isErr()) {
      return {
        success: false,
        error: result.error.message,
        code: result.error.details?.code as string | undefined,
      }
    }

    return { success: true }
  })
