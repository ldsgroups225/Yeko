import { getGrades as getGradesQuery } from '@repo/data-ops/queries/catalogs'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const getGrades = createServerFn()
  .inputValidator(z.object({}))
  .handler(async () => {
    return await getGradesQuery()
  })
