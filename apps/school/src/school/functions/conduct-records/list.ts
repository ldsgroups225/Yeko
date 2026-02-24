import {
  getConductRecords,
  getStudentConductSummary,
} from '@repo/data-ops/queries/conduct-records'
import { z } from 'zod'
import { authServerFn } from '../../lib/server-fn'
import { requirePermission } from '../../middleware/permissions'

/**
 * Get conduct records with filters
 */
export const listConductRecords = authServerFn
  .inputValidator(z.object({
    schoolYearId: z.string(),
    studentId: z.string().optional(),
    classId: z.string().optional(),
    type: z.enum(['incident', 'sanction', 'reward', 'note']).optional(),
    category: z.enum(['behavior', 'academic', 'attendance', 'uniform', 'property', 'violence', 'bullying', 'cheating', 'achievement', 'improvement', 'other']).optional(),
    status: z.enum(['open', 'investigating', 'pending_decision', 'resolved', 'closed', 'appealed']).optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
    page: z.number().default(1),
    pageSize: z.number().default(20),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      await requirePermission('conduct', 'view')
      const result = await getConductRecords({
        schoolId: context.school.schoolId,
        ...data,
      })
      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la récupération des dossiers de conduite' }
    }
  })

/**
 * Get student conduct summary
 */
export const getStudentSummary = authServerFn
  .inputValidator(z.object({
    studentId: z.string(),
    schoolYearId: z.string(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      await requirePermission('conduct', 'view')
      const result = await getStudentConductSummary(data.studentId, data.schoolYearId)
      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la récupération du résumé de conduite' }
    }
  })
