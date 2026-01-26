import { createServerFn } from '@tanstack/react-start'
import { getDb } from '@repo/data-ops/database/setup'
import { schools } from '@repo/data-ops/drizzle/core-schema'
import { teachers } from '@repo/data-ops/drizzle/school-schema'
import { eq, asc } from 'drizzle-orm'
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
      })
      .from(teachers)
      .innerJoin(schools, eq(teachers.schoolId, schools.id))
      .where(eq(teachers.userId, data.userId))
      .orderBy(asc(schools.name))

    return result
  })
