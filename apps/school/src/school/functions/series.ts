import { getSeries as getSeriesQuery } from '@repo/data-ops/queries/catalogs'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const getSeries = createServerFn()
  .inputValidator(z.object({}))
  .handler(async () => {
    return await getSeriesQuery()
  })
