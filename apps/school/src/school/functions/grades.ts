import { getGrades as getGradesQuery } from '@repo/data-ops/queries/catalogs'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'

export const getGrades = authServerFn
  .inputValidator(z.object({}))
  .handler(async ({ context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await getGradesQuery()
    return result.match(
      value => ({ success: true as const, data: value }),
      error => ({ success: false as const, error: error.message }),
    )
  })
