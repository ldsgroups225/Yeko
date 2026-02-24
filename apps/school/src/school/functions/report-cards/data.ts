import * as reportCardQueries from '@repo/data-ops/queries/report-cards'
import { z } from 'zod'
import { authServerFn } from '../../lib/server-fn'

/**
 * Get comprehensive report card data (marks, attendance, etc.)
 */
export const getReportCardData = authServerFn
  .inputValidator(
    z.object({
      studentId: z.string(),
      termId: z.string(),
      classId: z.string(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      const result = await reportCardQueries.getReportCardData(
        data.studentId,
        data.termId,
        data.classId,
      )
      return { success: true as const, data: result }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de la récupération des données du bulletin' }
    }
  })
