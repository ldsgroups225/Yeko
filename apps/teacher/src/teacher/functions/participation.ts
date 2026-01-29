import {
  getSessionParticipationGrades,
  upsertParticipationGrades,
} from '@repo/data-ops/queries/teacher-app'
import { createServerFn } from '@tanstack/react-start'

import { z } from 'zod'

// Record participation grades for a session
export const recordParticipation = createServerFn()
  .inputValidator(
    z.object({
      classSessionId: z.string(),
      teacherId: z.string(),
      grades: z.array(
        z.object({
          studentId: z.string(),
          grade: z.number().int().min(1).max(5),
          comment: z.string().optional(),
        }),
      ),
    }),
  )
  .handler(async ({ data }) => {
    const result = await upsertParticipationGrades({
      classSessionId: data.classSessionId,
      teacherId: data.teacherId,
      grades: data.grades,
    })

    if (result.isErr()) {
      return {
        success: false,
        error: result.error.message,
        code: result.error.details?.code as string | undefined,
      }
    }

    return {
      success: true,
    }
  })

// Get participation grades for a session
export const getParticipationGrades = createServerFn()
  .inputValidator(
    z.object({
      classSessionId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const gradesResult = await getSessionParticipationGrades(data.classSessionId)

    if (gradesResult.isErr()) {
      return {
        grades: [],
      }
    }

    const grades = gradesResult.value

    return {
      grades: grades.map(g => ({
        studentId: g.studentId,
        grade: g.grade,
        comment: g.comment,
      })),
    }
  })
