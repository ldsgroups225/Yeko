import type { EducationLevel, Serie, Track } from '@repo/data-ops'
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
    return (await getSmartCatalogData()).match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })
