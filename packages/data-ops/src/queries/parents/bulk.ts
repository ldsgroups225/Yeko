import type { Parent, Relationship } from '../../drizzle/school-schema'
import type { AutoMatchResult, CreateParentInput } from './types'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, isNull, or } from 'drizzle-orm'
import { getDb } from '../../database/setup'
import { parents, studentParents, students } from '../../drizzle/school-schema'
import { DatabaseError } from '../../errors'
import { getNestedErrorMessage } from '../../i18n'
import { createParent, linkParentToStudent } from './write'

// ==================== Auto-Matching ====================

export async function findParentByPhone(phone: string): R.ResultAsync<Parent | null, DatabaseError> {
  return R.try({
    try: async () => {
      const db = getDb()
      const normalizedPhone = phone.replace(/[\s\-()]/g, '')

      const [parent] = await db
        .select()
        .from(parents)
        .where(
          or(
            eq(parents.phone, normalizedPhone),
            eq(parents.phone, phone),
            eq(parents.phone2, normalizedPhone),
            eq(parents.phone2, phone),
          ),
        )

      return parent || null
    },
    catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('parents', 'findByPhoneFailed')),
  })
}

export async function autoMatchParents(schoolId: string): R.ResultAsync<AutoMatchResult, DatabaseError> {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()
        const results = {
          matched: 0,
          created: 0,
          suggestions: [] as Array<{
            studentId: string
            studentName: string
            phone: string
            existingParent?: typeof parents.$inferSelect
          }>,
        }

        const studentsWithoutParents = await db
          .select({
            student: students,
          })
          .from(students)
          .leftJoin(studentParents, eq(studentParents.studentId, students.id))
          .where(and(eq(students.schoolId, schoolId), eq(students.status, 'active'), isNull(studentParents.id)))
          .groupBy(students.id)

        for (const { student } of studentsWithoutParents) {
          if (student.emergencyPhone) {
            const checkResult = await findParentByPhone(student.emergencyPhone)
            if (checkResult.type === 'Success') {
              const existingParent = checkResult.value

              results.suggestions.push({
                studentId: student.id,
                studentName: `${student.firstName} ${student.lastName}`,
                phone: student.emergencyPhone,
                existingParent: existingParent || undefined,
              })
            }
          }
        }

        return results
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('parents', 'autoMatchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, action: 'auto_match_parents' })),
  )
}

// ==================== Bulk Operations ====================

export async function bulkImportParents(
  schoolId: string,
  parentsData: Array<CreateParentInput & { studentMatricule?: string, relationship?: Relationship }>,
): R.ResultAsync<{ success: number, errors: Array<{ row: number, error: string }> }, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const results = { success: 0, errors: [] as Array<{ row: number, error: string }> }

        for (let i = 0; i < parentsData.length; i++) {
          try {
            const item = parentsData[i]
            if (!item)
              continue
            const { studentMatricule, relationship, ...parentData } = item

            const phoneResult = await findParentByPhone(parentData.phone)

            let parent
            if (phoneResult.type === 'Success' && phoneResult.value) {
              parent = phoneResult.value
            }
            else {
              const createResult = await createParent(parentData)
              if (createResult.type === 'Failure')
                throw createResult.error
              parent = createResult.value
            }

            if (studentMatricule && parent) {
              const [student] = await db.select().from(students).where(eq(students.matricule, studentMatricule))

              if (student) {
                const linkResult = await linkParentToStudent({
                  schoolId,
                  studentId: student.id,
                  parentId: parent.id,
                  relationship: relationship || 'guardian',
                })
                if (linkResult.type === 'Failure' && (linkResult.error as DatabaseError).type !== 'CONFLICT') {
                  throw linkResult.error
                }
              }
            }

            results.success++
          }
          catch (error) {
            results.errors.push({
              row: i + 1,
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        }

        return results
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('parents', 'bulkImportFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, action: 'bulk_import_parents' })),
  )
}
