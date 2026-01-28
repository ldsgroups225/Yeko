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
    const homeworkResult = await createHomeworkAssignment({
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

    if (homeworkResult.isErr()) {
      return {
        success: false,
        error: homeworkResult.error.message,
      }
    }

    return {
      success: true,
      homeworkId: homeworkResult.value.id,
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

    if (result.isErr()) {
      return {
        homework: [],
        total: 0,
        page: data.page,
        pageSize: data.pageSize,
      }
    }

    return {
      homework: result.value.homework.map(h => ({
        id: h.id,
        title: h.title,
        className: h.className,
        subjectName: h.subjectName,
        dueDate: h.dueDate,
        dueTime: null, // Not available in this query
        status: h.status as 'draft' | 'active' | 'closed' | 'cancelled',
        submissionCount: h.submissionCount,
        totalStudents: 0, // Not available in current query
      })),
      total: result.value.total,
      page: result.value.page,
      pageSize: result.value.pageSize,
    }
  })

// Get homework details
export const getHomeworkDetails = createServerFn()
  .inputValidator(z.object({ homeworkId: z.string() }))
  .handler(async ({ data }) => {
    const homeworkResult = await getHomeworkById(data.homeworkId)

    if (homeworkResult.isErr() || !homeworkResult.value) {
      return { homework: null }
    }

    const homework = homeworkResult.value

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
        isGraded: homework.isGraded,
        attachments: homework.attachments,
        status: homework.status as 'draft' | 'active' | 'closed' | 'cancelled',
        createdAt: homework.createdAt?.toISOString() ?? new Date().toISOString(),
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
    const updatedResult = await updateHomeworkAssignment({
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

    if (updatedResult.isErr()) {
      return {
        success: false,
        error: updatedResult.error.message,
      }
    }

    return {
      success: true,
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
    const result = await deleteHomeworkAssignment({
      homeworkId: data.homeworkId,
      teacherId: data.teacherId,
    })

    if (result.isErr()) {
      return {
        success: false,
        error: result.error.message,
      }
    }

    return {
      success: true,
    }
  })
