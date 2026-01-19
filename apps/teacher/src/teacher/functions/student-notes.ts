/**
 * Student Notes Server Functions
 * Handles behavior and academic notes for students
 */
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// Schema for creating a student note
export const createNoteSchema = z.object({
  studentId: z.string(),
  classId: z.string(),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  type: z.enum(['behavior', 'academic', 'attendance', 'general']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  isPrivate: z.boolean().default(false),
})

// Schema for updating a student note
export const updateNoteSchema = z.object({
  noteId: z.string(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
})

// Schema for getting student notes
export const getNotesSchema = z.object({
  studentId: z.string(),
  classId: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
})

// Schema for getting behavior summary
export const getSummarySchema = z.object({
  studentId: z.string(),
  schoolYearId: z.string(),
})

// Schema for deleting a note
export const deleteNoteSchema = z.object({
  noteId: z.string(),
})

// Create a student note
export const createStudentNote = createServerFn()
  .inputValidator(createNoteSchema)
  .handler(async ({ data, context }) => {
    const { createStudentNote: createNote } = await import('@repo/data-ops/queries/teacher-notes')
    const note = await createNote({
      studentId: data.studentId,
      classId: data.classId,
      teacherId: context?.userId ?? data.teacherId ?? '',
      title: data.title,
      content: data.content,
      type: data.type,
      priority: data.priority,
      isPrivate: data.isPrivate,
    })

    return {
      success: true,
      note,
    }
  })

// Get notes for a student
export const getStudentNotes = createServerFn()
  .inputValidator(getNotesSchema)
  .handler(async ({ data }) => {
    const { getStudentNotes: fetchNotes } = await import('@repo/data-ops/queries/teacher-notes')
    const notes = await fetchNotes({
      studentId: data.studentId,
      classId: data.classId,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      limit: data.limit,
      offset: data.offset,
    })

    return {
      success: true,
      notes,
    }
  })

// Get behavior summary for a student
export const getBehaviorSummary = createServerFn()
  .inputValidator(getSummarySchema)
  .handler(async ({ data }) => {
    const { getBehaviorSummary: fetchSummary } = await import('@repo/data-ops/queries/teacher-notes')
    const summary = await fetchSummary({
      studentId: data.studentId,
      schoolYearId: data.schoolYearId,
    })

    return {
      success: true,
      summary,
    }
  })

// Update a student note
export const updateStudentNote = createServerFn()
  .inputValidator(updateNoteSchema)
  .handler(async ({ data, context }) => {
    const { updateStudentNote: updateNote } = await import('@repo/data-ops/queries/teacher-notes')
    const note = await updateNote({
      noteId: data.noteId,
      teacherId: context?.userId ?? '',
      title: data.title,
      content: data.content,
      priority: data.priority,
    })

    return {
      success: true,
      note,
    }
  })

// Delete a student note
export const deleteStudentNote = createServerFn()
  .inputValidator(deleteNoteSchema)
  .handler(async ({ data, context }) => {
    const { deleteStudentNote: deleteNote } = await import('@repo/data-ops/queries/teacher-notes')
    await deleteNote({
      noteId: data.noteId,
      teacherId: context?.userId ?? '',
    })

    return {
      success: true,
    }
  })

// Get notes trend for a student
export const getNotesTrend = createServerFn()
  .inputValidator(
    z.object({
      studentId: z.string(),
      months: z.number().default(6),
    })
  )
  .handler(async ({ data }) => {
    const { getNotesTrend: fetchTrend } = await import('@repo/data-ops/queries/teacher-notes')
    const trend = await fetchTrend({
      studentId: data.studentId,
      months: data.months,
    })

    return {
      success: true,
      trend,
    }
  })
