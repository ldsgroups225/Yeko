import { getSubjects } from '@repo/data-ops/queries/catalogs'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const subjectsInputSchema = z.object({
  search: z.string().optional(),
  category: z.enum(['Scientifique', 'Littéraire', 'Sportif', 'Autre']).optional(),
}).optional()

/**
 * Get all subjects
 */
export const getAllSubjects = createServerFn()
  .inputValidator(subjectsInputSchema)
  .handler(async ({ data }: { data?: z.infer<typeof subjectsInputSchema> }) => {
    return await getSubjects(data)
  })
