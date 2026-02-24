import { getDb } from '@repo/data-ops/database/setup'
import { grades, series } from '@repo/data-ops/drizzle/core-schema'
import {
  and,
  eq,
} from '@repo/data-ops/drizzle/operators'
import {
  classes,
  enrollments,
  parents,
  studentParents,
  students,
} from '@repo/data-ops/drizzle/school-schema'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'
import {
  studentImportRowSchema,
} from '@/schemas/bulk-operations'
import { generateUUID } from '@/utils/generateUUID'
import { authServerFn } from '../../lib/server-fn'
import { requirePermission } from '../../middleware/permissions'

/**
 * Validate import data before processing
 */
export const validateImportData = authServerFn
  .inputValidator(z.object({
    rows: z.array(z.record(z.string(), z.unknown())),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('students', 'create')
    const db = getDb()

    const results = {
      isValid: true,
      totalRows: data.rows.length,
      validRows: 0,
      invalidRows: 0,
      errors: [] as Array<{ row: number, field: string, message: string }>,
      preview: [] as z.infer<typeof studentImportRowSchema>[],
    }

    try {
      const gradesList = await db.select({ code: grades.code }).from(grades)
      const validGradeCodes = new Set(gradesList.map((g: { code: string }) => g.code))

      const seriesList = await db.select({ code: series.code }).from(series)
      const validSeriesCodes = new Set(seriesList.map((s: { code: string }) => s.code))

      for (let i = 0; i < data.rows.length; i++) {
        const row = data.rows[i]
        const rowNum = i + 2

        if (!row) {
          results.invalidRows++
          results.isValid = false
          results.errors.push({
            row: rowNum,
            field: 'row',
            message: 'Ligne vide',
          })
          continue
        }

        try {
          const parsed = studentImportRowSchema.parse(row)

          if (!validGradeCodes.has(parsed.gradeCode)) {
            results.errors.push({
              row: rowNum,
              field: 'gradeCode',
              message: `Code niveau invalide: ${parsed.gradeCode}`,
            })
            results.invalidRows++
            results.isValid = false
            continue
          }

          if (parsed.seriesCode && !validSeriesCodes.has(parsed.seriesCode)) {
            results.errors.push({
              row: rowNum,
              field: 'seriesCode',
              message: `Code série invalide: ${parsed.seriesCode}`,
            })
            results.invalidRows++
            results.isValid = false
            continue
          }

          results.validRows++
          if (results.preview.length < 10) {
            results.preview.push(parsed)
          }
        }
        catch (error) {
          results.invalidRows++
          results.isValid = false

          if (error instanceof z.ZodError) {
            for (const issue of error.issues) {
              results.errors.push({
                row: rowNum,
                field: issue.path.join('.'),
                message: issue.message,
              })
            }
          }
        }
      }

      return { success: true as const, data: results }
    }
    catch {
      return { success: false as const, error: 'La validation des données a échoué' }
    }
  })

/**
 * Import students from validated data
 */
export const importStudents = authServerFn
  .inputValidator(z.object({
    rows: z.array(studentImportRowSchema),
    classId: z.string().optional(),
    schoolYearId: z.string(),
    autoEnroll: z.boolean().default(true),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('students', 'create')
    const db = getDb()

    const results = {
      total: data.rows.length,
      succeeded: 0,
      failed: 0,
      errors: [] as Array<{ row: number, error: string }>,
    }

    try {
      const gradesList = await db.select().from(grades)
      const gradeByCode = new Map(gradesList.map(g => [g.code, g] as const))

      const seriesList = await db.select().from(series)
      const seriesByCode = new Map(seriesList.map(s => [s.code, s] as const))

      const classesList = await db
        .select()
        .from(classes)
        .where(and(
          eq(classes.schoolId, schoolId),
          eq(classes.schoolYearId, data.schoolYearId),
        ))

      const classLookup = new Map<string, string>()
      for (const c of classesList) {
        const key = `${c.gradeId}-${c.seriesId ?? 'null'}-${c.section}`
        classLookup.set(key, c.id)
      }

      const today = new Date().toISOString().split('T')[0] ?? new Date().toISOString().slice(0, 10)

      await db.transaction(async (tx) => {
        const studentRecords: (typeof students.$inferInsert)[] = []
        const parentRecords: (typeof parents.$inferInsert)[] = []
        const studentParentLinks: (typeof studentParents.$inferInsert)[] = []
        const enrollmentRecords: (typeof enrollments.$inferInsert)[] = []
        const parentsByPhone = new Map<string, string>()

        for (const row of data.rows) {
          const dateParts = row.dob.split('/')
          const dob = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`

          const studentId = generateUUID()
          const shortId = generateUUID().slice(0, 4).toUpperCase()
          const matricule = `${schoolId.slice(0, 2).toUpperCase()}${dateParts[2]}${shortId}`

          studentRecords.push({
            id: studentId,
            schoolId,
            firstName: row.firstName,
            lastName: row.lastName,
            dob,
            gender: row.gender,
            matricule,
            status: 'active' as const,
            admissionDate: today,
          })

          if (row.parentName && row.parentPhone) {
            let parentId = parentsByPhone.get(row.parentPhone)
            if (!parentId) {
              parentId = generateUUID()
              parentsByPhone.set(row.parentPhone, parentId)

              const nameParts = row.parentName.split(' ')
              parentRecords.push({
                id: parentId,
                firstName: nameParts[0] ?? row.parentName,
                lastName: nameParts.slice(1).join(' ') || row.lastName,
                phone: row.parentPhone,
                email: row.parentEmail || null,
              })
            }

            studentParentLinks.push({
              id: generateUUID(),
              studentId,
              parentId,
              relationship: 'guardian' as const,
              isPrimary: true,
            })
          }

          if (data.autoEnroll) {
            const grade = gradeByCode.get(row.gradeCode)
            const seriesObj = row.seriesCode ? seriesByCode.get(row.seriesCode) : null

            if (grade) {
              const classKey = `${grade.id}-${seriesObj?.id ?? 'null'}-${row.section ?? '1'}`
              const targetClassId = data.classId ?? classLookup.get(classKey)

              if (targetClassId) {
                enrollmentRecords.push({
                  id: generateUUID(),
                  studentId,
                  classId: targetClassId,
                  schoolYearId: data.schoolYearId,
                  status: 'confirmed' as const,
                  enrollmentDate: today,
                  confirmedAt: new Date(),
                })
              }
            }
          }
        }

        if (studentRecords.length > 0)
          await tx.insert(students).values(studentRecords)
        if (parentRecords.length > 0)
          await tx.insert(parents).values(parentRecords).onConflictDoNothing()
        if (studentParentLinks.length > 0)
          await tx.insert(studentParents).values(studentParentLinks)
        if (enrollmentRecords.length > 0)
          await tx.insert(enrollments).values(enrollmentRecords)

        results.succeeded = data.rows.length
      })

      await createAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'students',
        recordId: 'bulk-import',
        newValues: { count: data.rows.length },
      })

      return { success: true as const, data: results }
    }
    catch {
      return { success: false as const, error: 'L\'importation a échoué' }
    }
  })
