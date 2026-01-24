import { getSubjects } from '@repo/data-ops/queries/catalogs'
import { getSchoolSubjects } from '@repo/data-ops/queries/school-subjects'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requirePermission } from '../middleware/permissions'
import { getSchoolYearContext } from '../middleware/school-context'

const subjectsInputSchema = z.object({
  search: z.string().optional(),
  category: z.enum(['Scientifique', 'Littéraire', 'Sportif', 'Autre']).optional(),
}).optional()

/**
 * Get all subjects (global catalog)
 */
export const getAllSubjects = createServerFn()
  .inputValidator(subjectsInputSchema)
  .handler(async ({ data }: { data?: z.infer<typeof subjectsInputSchema> }) => {
    return await getSubjects(data)
  })

/**
 * Get all subjects of the school for the current year
 */
export const getAllSubjectsOfTheSchoolThisCurrentYear = createServerFn()
  .inputValidator(subjectsInputSchema)
  .handler(async ({ data }: { data?: z.infer<typeof subjectsInputSchema> }) => {
    const context = await getSchoolYearContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('school_subjects', 'view')

    const result = await getSchoolSubjects({
      schoolId: context.schoolId,
      schoolYearId: context.schoolYearId,
      status: 'active',
      search: data?.search,
      category: data?.category,
      limit: 100,
    })

    return {
      subjects: result.subjects.map(s => s.subject),
    }
  })
