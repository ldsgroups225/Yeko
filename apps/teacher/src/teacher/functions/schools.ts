import { Result as R } from '@praha/byethrow'
import { asc, eq, getDb } from '@repo/data-ops/database/setup'
import { schools } from '@repo/data-ops/drizzle/core-schema'
import { teachers } from '@repo/data-ops/drizzle/school-schema'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const getTeacherSchoolsQuery = createServerFn()
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const db = getDb()

    const result = await db
      .select({
        id: schools.id,
        name: schools.name,
        code: schools.code,
        address: schools.address,
        phone: schools.phone,
        email: schools.email,
        logoUrl: schools.logoUrl,
      })
      .from(teachers)
      .innerJoin(schools, eq(teachers.schoolId, schools.id))
      .where(eq(teachers.userId, data.userId))
      .orderBy(asc(schools.name))

    return result
  })

export const getCurrentTermFn = createServerFn()
  .inputValidator(z.object({ schoolYearId: z.string() }))
  .handler(async ({ data }) => {
    const { getCurrentTermForSchoolYear } = await import('@repo/data-ops/queries/teacher-app')
    const result = await getCurrentTermForSchoolYear(data.schoolYearId)

    if (R.isFailure(result)) {
      return null
    }

    return result.value
  })
