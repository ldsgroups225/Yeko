import { getOnboardingStatus as getOnboardingStatusQuery } from '@repo/data-ops/queries/onboarding'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getSchoolContext } from '@/school/middleware/school-context'

export const getOnboardingStatus = createServerFn()
  .inputValidator(z.void())
  .handler(async () => {
    const context = await getSchoolContext()
    if (!context)
      return { hasIdentity: false, hasYear: false, hasStructure: false }

    return await getOnboardingStatusQuery(context.schoolId)
  })
