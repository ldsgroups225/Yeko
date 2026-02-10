import { Result as R } from '@praha/byethrow'
import { getTeacherSchoolsCount } from '@repo/data-ops/queries/school-admin/teachers'
// Placeholder for real DB queries
// This will be replaced by actual database calls when integrating with backend
import { getTeacherAssignedClasses } from '@repo/data-ops/queries/teacher-app'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getTeacherContext } from '../middleware/teacher-context'

export const getTeacherStats = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolYearId: z.string().optional().nullable(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getTeacherContext()
    if (!context) {
      return {
        schoolsCount: 0,
        classesCount: 0,
      }
    }

    const [classesResult, schoolsCount] = await Promise.all([
      getTeacherAssignedClasses({
        teacherId: data.teacherId,
        schoolYearId: data.schoolYearId,
      }),
      getTeacherSchoolsCount(context.userId),
    ])

    const classes = R.isSuccess(classesResult) ? classesResult.value : []

    return {
      schoolsCount,
      classesCount: classes.length,
    }
  })
