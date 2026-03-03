import type { PaginatedParents, ParentFilters, ParentWithDetails, StudentParentDetail } from './types'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, ilike, or, sql } from 'drizzle-orm'
import { getDb } from '../../database/setup'
import { parents, studentParents, students, users } from '../../drizzle/school-schema'
import { DatabaseError } from '../../errors'
import { getNestedErrorMessage } from '../../i18n'

// ==================== Queries ====================

export async function getParents(
  schoolId: string,
  filters: ParentFilters,
): R.ResultAsync<
  PaginatedParents,
  DatabaseError
> {
  const { search, invitationStatus, hasChildren, page = 1, limit = 20 } = filters

  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()
        const offset = (page - 1) * limit

        const conditions = [eq(students.schoolId, schoolId)]

        if (search) {
          conditions.push(
            or(
              ilike(parents.firstName, `%${search}%`),
              ilike(parents.lastName, `%${search}%`),
              ilike(parents.phone, `%${search}%`),
            )!,
          )
        }

        if (invitationStatus) {
          conditions.push(eq(parents.invitationStatus, invitationStatus))
        }

        const query = db
          .select({
            parent: parents,
            childrenCount: sql<number>`COUNT(DISTINCT ${studentParents.id})`,
            hasUser: sql<boolean>`CASE WHEN ${parents.userId} IS NOT NULL THEN true ELSE false END`,
          })
          .from(parents)
          .leftJoin(studentParents, eq(studentParents.parentId, parents.id))
          .leftJoin(students, eq(studentParents.studentId, students.id))
          .where(and(...conditions))
          .groupBy(parents.id)

        const data = await query.limit(limit).offset(offset)

        let processedData = data.map(d => ({
          ...d.parent,
          childrenCount: Number(d.childrenCount),
          hasUser: Boolean(d.hasUser),
        }))

        if (hasChildren !== undefined) {
          processedData = processedData.filter(p => (hasChildren ? p.childrenCount > 0 : p.childrenCount === 0))
        }

        // Get total count
        const countResult = await db
          .select({ count: sql<number>`COUNT(DISTINCT ${parents.id})` })
          .from(parents)
          .leftJoin(studentParents, eq(studentParents.parentId, parents.id))
          .leftJoin(students, eq(studentParents.studentId, students.id))
          .where(and(...conditions))

        return {
          data: processedData,
          total: Number(countResult[0]?.count || 0),
          page,
          totalPages: Math.ceil(Number(countResult[0]?.count || 0) / limit),
        }
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('parents', 'fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, action: 'get_parents' })),
  )
}

export async function getParentById(id: string): R.ResultAsync<ParentWithDetails, DatabaseError> {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()
        const [parent] = await db
          .select({
            parent: parents,
            user: users,
          })
          .from(parents)
          .leftJoin(users, eq(parents.userId, users.id))
          .where(eq(parents.id, id))

        if (!parent)
          throw new DatabaseError('NOT_FOUND', getNestedErrorMessage('parents', 'notFound'))

        // Get linked children
        const children = await db
          .select({
            student: students,
            relationship: studentParents.relationship,
            isPrimary: studentParents.isPrimary,
            canPickup: studentParents.canPickup,
            receiveNotifications: studentParents.receiveNotifications,
          })
          .from(studentParents)
          .innerJoin(students, eq(studentParents.studentId, students.id))
          .where(eq(studentParents.parentId, id))

        return { ...parent.parent, user: parent.user, children } as unknown as ParentWithDetails
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('parents', 'fetchByIdFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { parentId: id, action: 'get_parent_by_id' })),
  )
}

export async function getStudentParents(studentId: string): R.ResultAsync<StudentParentDetail[], DatabaseError> {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()
        const results = await db
          .select({
            parent: parents,
            relationship: studentParents.relationship,
            isPrimary: studentParents.isPrimary,
          })
          .from(studentParents)
          .innerJoin(parents, eq(studentParents.parentId, parents.id))
          .where(eq(studentParents.studentId, studentId))

        return results
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('parents', 'fetchStudentParentsFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId, action: 'get_student_parents' })),
  )
}
