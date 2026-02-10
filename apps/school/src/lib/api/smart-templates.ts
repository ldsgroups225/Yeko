import type { EducationLevel, Serie, Track } from '@repo/data-ops'
import { Result as R } from '@praha/byethrow'
import { getSmartCatalogData } from '@repo/data-ops/queries/catalogs'
import { createServerFn } from '@tanstack/react-start'
import * as z from 'zod'

// --- Server Functions ---

export interface SmartTemplatesResponse {
  educationLevels: EducationLevel[]
  tracks: Track[]
  series: Serie[]
}

export const getSmartTemplatesFn = createServerFn()
  .inputValidator(z.void())
  .handler(async () => {
    const _result1 = await getSmartCatalogData()
    if (R.isFailure(_result1))
      return { success: false as const, error: _result1.error.message }
    return { success: true as const, data: _result1.value }
  })
