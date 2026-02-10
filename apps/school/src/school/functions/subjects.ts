import { Result as R } from '@praha/byethrow'
import { getSubjects } from '@repo/data-ops/queries/catalogs'
import { getSchoolSubjects } from '@repo/data-ops/queries/school-subjects'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

const subjectsInputSchema = z.object({
  search: z.string().optional(),
  category: z.enum(['Scientifique', 'Littéraire', 'Sportif', 'Autre']).optional(),
}).optional()

/**
 * Get all subjects (global catalog)
 */
export const getAllSubjects = authServerFn
  .inputValidator(subjectsInputSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await getSubjects(data)

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message || 'Erreur lors de la récupération des matières' }
    return { success: true as const, data: result.value }
  })

/**
 * Get all subjects of the school for the current year
 */
export const getAllSubjectsOfTheSchoolThisCurrentYear = authServerFn
  .inputValidator(subjectsInputSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    const schoolYearId = context.schoolYear?.schoolYearId

    if (!schoolYearId)
      return { success: false as const, error: 'Année scolaire non sélectionnée' }

    await requirePermission('school_subjects', 'view')

    const result = await getSchoolSubjects({
      schoolId,
      schoolYearId,
      status: 'active',
      search: data?.search,
      category: data?.category,
      limit: 100,
    })

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message || 'Erreur lors de la récupération des matières de l\'école' }
    return {
      success: true as const,
      data: {
        subjects: result.value.subjects.map(s => s.subject),
      },
    }
  })
