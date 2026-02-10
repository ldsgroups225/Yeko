import { Result as R } from '@praha/byethrow'
import { getSeries as getSeriesQuery } from '@repo/data-ops/queries/catalogs'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'

export const getSeries = authServerFn
  .inputValidator(z.object({}))
  .handler(async ({ context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await getSeriesQuery()
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })
