import {
  createHomeworkAssignment,
  deleteHomeworkAssignment,
  getHomeworkById,
  getTeacherHomework,
  updateHomeworkAssignment,
} from '@repo/data-ops/queries/teacher-app'
import { createServerFn } from '@tanstack/react-start'

import { z } from 'zod'

import { homeworkSchema, homeworkUpdateSchema } from '@/schemas/homework'

// Create homework assignment
export const createHomework = createServerFn()
  .inputValidator(homeworkSchema)
  .handler(async ({ data }) => {
    try {
      const homework = await createHomeworkAssignment({
        schoolId: data.schoolId,
        classId: data.classId,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        classSessionId: data.classSessionId,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        dueDate: data.dueDate,
        dueTime: data.dueTime,
        maxPoints: data.maxPoints,
        isGraded: data.isGraded,
        attachments: data.attachments,
        status: data.status,
      })

      return {
        success: true,
        homeworkId: homework?.id,
      }
    }
    catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create homework',
      }
    }
  })

// Get homework list
export const getHomework = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      classId: z.string().optional(),
      subjectId: z.string().optional(),
      status: z.enum(['draft', 'active', 'closed', 'cancelled']).optional(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(50).default(20),
    }),
  )
  .handler(async ({ data }) => {
    const result = await getTeacherHomework({
      teacherId: data.teacherId,
      classId: data.classId,
      subjectId: data.subjectId,
      status: data.status,
      page: data.page,
      pageSize: data.pageSize,
    })

    return {
      homework: result.homework.map(h => ({
        id: h.id,
        title: h.title,
        className: h.className,
        subjectName: h.subjectName,
        dueDate: h.dueDate,
        dueTime: h.dueTime,
        status: h.status as 'draft' | 'active' | 'closed' | 'cancelled',
        submissionCount: h.submissionCount,
        totalStudents: 0, // Not available in current query
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    }
  })

// Get homework details
export const getHomeworkDetails = createServerFn()
  .inputValidator(z.object({ homeworkId: z.string() }))
  .handler(async ({ data }) => {
    const homework = await getHomeworkById(data.homeworkId)

    if (!homework) {
      return { homework: null }
    }

    return {
      homework: {
        id: homework.id,
        title: homework.title,
        description: homework.description,
        instructions: homework.instructions,
        className: homework.className,
        subjectName: homework.subjectName,
        dueDate: homework.dueDate,
        dueTime: homework.dueTime,
        maxPoints: homework.maxPoints,
        isGraded: homework.isGraded ?? false,
        attachments: (homework.attachments ?? []) as Array<{
          name: string
          url: string
          type: string
          size: number
        }>,
        status: homework.status as 'draft' | 'active' | 'closed' | 'cancelled',
        createdAt: homework.createdAt.toISOString(),
      },
    }
  })

// Update homework
export const updateHomework = createServerFn()
  .inputValidator(
    homeworkUpdateSchema.extend({
      teacherId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const updated = await updateHomeworkAssignment({
        homeworkId: data.id,
        teacherId: data.teacherId,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        dueDate: data.dueDate,
        dueTime: data.dueTime,
        maxPoints: data.maxPoints,
        isGraded: data.isGraded,
        attachments: data.attachments,
        status: data.status,
      })

      return {
        success: !!updated,
      }
    }
    catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update homework',
      }
    }
  })

// Delete homework
export const deleteHomework = createServerFn()
  .inputValidator(
    z.object({
      homeworkId: z.string(),
      teacherId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const result = await deleteHomeworkAssignment({
        homeworkId: data.homeworkId,
        teacherId: data.teacherId,
      })

      return {
        success: !!result,
      }
    }
    catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete homework',
      }
    }
  })
