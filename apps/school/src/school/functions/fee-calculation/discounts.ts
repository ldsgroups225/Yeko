import { getDb } from '@repo/data-ops/database/setup'
import {
  and,
  eq,
  sql,
} from '@repo/data-ops/drizzle/operators'
import {
  discounts,
  studentDiscounts,
} from '@repo/data-ops/drizzle/school-schema'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'
import { generateUUID } from '@/utils/generateUUID'
import { authServerFn } from '../../lib/server-fn'
import { requirePermission } from '../../middleware/permissions'

/**
 * Apply sibling discount automatically
 */
export const applySiblingDiscount = authServerFn
  .inputValidator(z.object({
    studentId: z.string(),
    schoolYearId: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    try {
      await requirePermission('finance', 'edit')
      const schoolYearIdValue = data.schoolYearId ?? context.schoolYear?.schoolYearId
      if (!schoolYearIdValue)
        return { success: false as const, error: 'Année scolaire non sélectionnée' }

      const db = getDb()

      const [siblingDiscount] = await db
        .select()
        .from(discounts)
        .where(and(
          eq(discounts.schoolId, schoolId),
          eq(discounts.type, 'sibling'),
          eq(discounts.status, 'active'),
          eq(discounts.autoApply, true),
        ))
        .limit(1)

      if (!siblingDiscount) {
        return { success: false as const, error: 'Aucune remise de fratrie configurée' }
      }

      const studentParentLinks = await db.execute(sql`
        SELECT parent_id FROM student_parents WHERE student_id = ${data.studentId}
      `)

      if (!studentParentLinks.rows.length) {
        return { success: false as const, error: 'Aucun parent lié à l\'étudiant' }
      }

      const parentIds = (studentParentLinks.rows as Array<{ parent_id: string }>).map(r => r.parent_id)

      const siblingsCountResult = await db.execute(sql`
        SELECT COUNT(DISTINCT sp.student_id) as count
        FROM student_parents sp
        INNER JOIN enrollments e ON sp.student_id = e.student_id
        WHERE sp.parent_id = ANY(${parentIds})
          AND e.school_year_id = ${schoolYearIdValue}
          AND e.status = 'confirmed'
          AND sp.student_id != ${data.studentId}
      `)

      const siblingCount = Number(siblingsCountResult.rows[0]?.count ?? 0)

      if (siblingCount === 0) {
        return { success: false as const, error: 'Aucun frère ou sœur inscrit' }
      }

      const existingDiscount = await db
        .select()
        .from(studentDiscounts)
        .where(and(
          eq(studentDiscounts.studentId, data.studentId),
          eq(studentDiscounts.discountId, siblingDiscount.id),
          eq(studentDiscounts.schoolYearId, schoolYearIdValue),
        ))
        .limit(1)

      if (existingDiscount.length > 0) {
        return { success: false as const, error: 'Remise de fratrie déjà appliquée' }
      }

      const calculatedAmount = siblingDiscount.calculationType === 'percentage'
        ? 0
        : Number(siblingDiscount.value)

      const id = generateUUID()
      await db.insert(studentDiscounts).values({
        id,
        studentId: data.studentId,
        discountId: siblingDiscount.id,
        schoolYearId: schoolYearIdValue,
        calculatedAmount: calculatedAmount.toString(),
        status: siblingDiscount.requiresApproval ? 'pending' : 'approved',
      })

      await createAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'student_discounts',
        recordId: id,
        newValues: { studentId: data.studentId, discountId: siblingDiscount.id },
      })

      return {
        success: true as const,
        data: {
          discountId: siblingDiscount.id,
          siblingCount,
          requiresApproval: siblingDiscount.requiresApproval,
        },
      }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de l\'application de la remise de fratrie' }
    }
  })
