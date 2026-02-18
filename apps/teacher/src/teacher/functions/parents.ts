import { Result as R } from '@praha/byethrow'
import { getStudentParents } from '@repo/data-ops/queries/parents'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const getStudentParentsFn = createServerFn()
  .inputValidator(z.object({ studentId: z.string() }))
  .handler(async ({ data }) => {
    const result = await getStudentParents(data.studentId)
    if (R.isFailure(result)) {
      throw new Error(result.error instanceof Error ? result.error.message : String(result.error))
    }
    return result.value
  })
