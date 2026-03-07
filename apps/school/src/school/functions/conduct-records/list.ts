import { Result as R } from '@praha/byethrow'
import {
  getConductRecords,
  getConductRecordsKeyset,
  getStudentConductSummary,
} from '@repo/data-ops/queries/conduct-records'
import { getStudentsAttendanceSnapshot } from '@repo/data-ops/queries/student-attendance'
import { getStudents as getStudentsQuery } from '@repo/data-ops/queries/students-read'
import { z } from 'zod'
import { authServerFn } from '../../lib/server-fn'
import { requirePermission } from '../../middleware/permissions'

/**
 * Get conduct records with filters
 */
export const listConductRecords = authServerFn
  .inputValidator(z.object({
    schoolYearId: z.string(),
    studentId: z.string().optional(),
    classId: z.string().optional(),
    type: z.enum(['incident', 'sanction', 'reward', 'note']).optional(),
    category: z.enum(['behavior', 'academic', 'attendance', 'uniform', 'property', 'violence', 'bullying', 'cheating', 'achievement', 'improvement', 'other']).optional(),
    status: z.enum(['open', 'investigating', 'pending_decision', 'resolved', 'closed', 'appealed']).optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
    page: z.number().default(1),
    pageSize: z.number().default(20),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      await requirePermission('conduct', 'view')
      const result = await getConductRecords({
        schoolId: context.school.schoolId,
        ...data,
      })
      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la récupération des dossiers de conduite' }
    }
  })

/**
 * Get conduct records with keyset pagination
 */
export const listConductRecordsKeyset = authServerFn
  .inputValidator(z.object({
    schoolYearId: z.string(),
    studentId: z.string().optional(),
    classId: z.string().optional(),
    type: z.enum(['incident', 'sanction', 'reward', 'note']).optional(),
    category: z.enum(['behavior', 'academic', 'attendance', 'uniform', 'property', 'violence', 'bullying', 'cheating', 'achievement', 'improvement', 'other']).optional(),
    status: z.enum(['open', 'investigating', 'pending_decision', 'resolved', 'closed', 'appealed']).optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
    pageSize: z.number().default(20),
    cursor: z.object({
      createdAt: z.date(),
      id: z.string().min(1),
    }).optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      await requirePermission('conduct', 'view')
      const result = await getConductRecordsKeyset({
        schoolId: context.school.schoolId,
        ...data,
      })
      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la récupération des dossiers de conduite' }
    }
  })

/**
 * Get student conduct summary
 */
export const getStudentSummary = authServerFn
  .inputValidator(z.object({
    studentId: z.string(),
    schoolYearId: z.string(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      await requirePermission('conduct', 'view')
      const result = await getStudentConductSummary(data.studentId, data.schoolYearId)
      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la récupération du résumé de conduite' }
    }
  })

/**
 * Get students for the conduct module.
 * Uses conduct permissions so the page does not depend on students.view.
 */
export const listConductStudents = authServerFn
  .inputValidator(z.object({
    schoolYearId: z.string().optional(),
    classId: z.string().optional(),
    search: z.string().optional(),
    page: z.number().default(1),
    limit: z.number().default(200),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      await requirePermission('conduct', 'view')
      const primaryResult = await getStudentsQuery({
        schoolId: context.school.schoolId,
        schoolYearId: data.schoolYearId,
        classId: data.classId,
        search: data.search,
        page: data.page,
        limit: data.limit,
        status: 'active',
      })

      if (R.isFailure(primaryResult)) {
        return { success: false as const, error: primaryResult.error.message }
      }

      let roster = primaryResult.value

      if (!(primaryResult.value.total > 0 || data.classId || !data.schoolYearId)) {
        // Some schools have active students but incomplete enrollment data for the
        // currently selected year. In that case, keep the conduct page usable by
        // falling back to the active student roster for the school.
        const fallbackResult = await getStudentsQuery({
          schoolId: context.school.schoolId,
          search: data.search,
          page: data.page,
          limit: data.limit,
          status: 'active',
        })

        if (R.isFailure(fallbackResult)) {
          return { success: false as const, error: fallbackResult.error.message }
        }

        roster = fallbackResult.value
      }

      const attendanceSnapshotResult = await getStudentsAttendanceSnapshot({
        schoolId: context.school.schoolId,
        studentIds: roster.data.map(entry => entry.student.id),
        classId: data.classId,
      })

      if (R.isFailure(attendanceSnapshotResult)) {
        return { success: false as const, error: attendanceSnapshotResult.error.message }
      }

      const attendanceByStudentId = new Map(
        attendanceSnapshotResult.value.map(snapshot => [snapshot.studentId, snapshot]),
      )

      return {
        success: true as const,
        data: {
          ...roster,
          data: roster.data.map(entry => ({
            ...entry,
            attendanceSummary: attendanceByStudentId.get(entry.student.id) ?? null,
          })),
        },
      }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la récupération des élèves pour la conduite' }
    }
  })
