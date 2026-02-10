/**
 * Remote Publish Provider
 * Connects the local sync service to the remote server functions
 */
import type { NoteWithDetails } from '../db/local-notes'
import type { RemotePublishHandler } from './sync-service'
import { submitGrades } from '../../teacher/functions/grades'
import { createStudentNote } from '../../teacher/functions/student-notes'

/**
 * Implementation of RemotePublishHandler using Yeko server functions
 */
export const remotePublishHandler: RemotePublishHandler = async (note: NoteWithDetails) => {
  try {
    // If it's a grade evaluation (CLASS_TEST, WRITING_QUESTION, etc.)
    if (note.type !== 'behavior' && note.type !== 'general' && note.type !== 'other') {
      // Map local note details to remote grades format
      const grades = note.details.map(detail => ({
        studentId: detail.studentId,
        grade: Number(detail.value || 0),
      }))

      // Call the submitGrades server function
      const result = await submitGrades({
        data: {
          teacherId: note.teacherId,
          schoolId: note.schoolId,
          schoolYearId: String(note.schoolYearId || ''),
          classId: note.classId,
          subjectId: note.subjectId || '',
          grades,
          status: note.isPublished ? 'submitted' : 'draft',
          // Map local type to remote gradeType
          gradeType: mapNoteTypeToGradeType(note.type),
        },
      })

      if (result.success) {
        return { success: true }
      }
      else {
        return { success: false, error: (result as { error?: string }).error || 'Failed to submit grades' }
      }
    }
    // If it's a behavioral or student-specific note
    else {
      // For behavior notes, we might need to handle per-student if the local note has details
      // But typically a "Note" in our local system is a batch.
      // If there's only one student detail, we can use createStudentNote.
      // If there are multiple, we might need a batch create.

      // For now, let's assume if it's a behavior note, it's for one student or we create one per student detail.
      if (note.details.length === 0) {
        return { success: false, error: 'No student details found for behavior note' }
      }

      let allSuccessful = true
      let lastError = ''

      for (const detail of note.details) {
        const result = await createStudentNote({
          data: {
            studentId: detail.studentId,
            classId: note.classId,
            teacherId: note.teacherId,
            title: note.title,
            content: note.description || 'N/A',
            type: note.type as 'behavior' | 'general' | 'other',
            priority: 'medium',
            isPrivate: false,
          },
        })

        if (!result.success) {
          allSuccessful = false
          lastError = 'Failed to create behavior note'
        }
      }

      return {
        success: allSuccessful,
        error: allSuccessful ? undefined : lastError,
      }
    }
  }
  catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Helper to map local note types to remote grade types
 */
function mapNoteTypeToGradeType(type: string): 'quiz' | 'test' | 'exam' | 'participation' | 'homework' | 'project' {
  const mapping: Record<string, 'quiz' | 'test' | 'exam' | 'participation' | 'homework' | 'project'> = {
    // Local PGlite note types
    tests: 'test',
    quizzes: 'quiz',
    level_tests: 'exam',
    // Legacy uppercase types
    CLASS_TEST: 'test',
    WRITING_QUESTION: 'quiz',
    EXAM: 'exam',
    HOMEWORK: 'homework',
    PARTICIPATION: 'participation',
    PROJECT: 'project',
  }
  return mapping[type] || 'test'
}
