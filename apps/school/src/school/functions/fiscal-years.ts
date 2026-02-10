import { Result as R } from '@praha/byethrow'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { getFiscalYearsBySchool, updateFiscalYear } from '@repo/data-ops/queries/school-admin/fiscal-years'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

export const getFiscalYears = authServerFn.handler(async ({ context }) => {
  if (!context?.school)
    return { success: false as const, error: 'Établissement non sélectionné' }

  await requirePermission('finance', 'view')
  const _result1 = await getFiscalYearsBySchool(context.school.schoolId)
  if (R.isFailure(_result1))
    return { success: false as const, error: 'Erreur lors de la récupération des années fiscales' }
  return { success: true as const, data: _result1.value }
})

export const closeFiscalYear = authServerFn
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('finance', 'edit')

    const _result2 = await updateFiscalYear(data.id, schoolId, {
      status: 'closed',
      closedAt: new Date(),
      closedBy: userId,
    })
    if (R.isFailure(_result2))
      return { success: false as const, error: 'Erreur lors de la clôture de l\'année fiscale' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'fiscal_years',
      recordId: data.id,
      newValues: { status: 'closed' },
    })
    return { success: true as const, data: _result2.value }
  })
