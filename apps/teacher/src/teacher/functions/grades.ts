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
    const currentTerm = await getCurrentTermForSchoolYear(data.schoolYearId)

    if (!currentTerm) {
      return { success: false, error: 'No term found for current school year' }
    }

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

    return result
  })
