'use client'

import type { NoteWithDetails } from '../lib/db/local-notes'
import type { NewNote, NewNoteDetail, Note } from '../lib/db/schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { localNotesService } from '../lib/db/local-notes'
import { useDatabaseStatus } from './useDatabaseStatus'

// ============================================================================
// Types
// ============================================================================

export interface UseLocalNotesOptions {
  classId?: string
  teacherId?: string
  includeUnpublished?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export interface UseLocalNotesReturn {
  notes: Note[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<any>
  saveNote: (note: NewNote, details?: NewNoteDetail[]) => Promise<void>
  updateNote: (
    noteId: string,
    updates: Partial<NewNote>,
    details?: NewNoteDetail[],
  ) => Promise<void>
  deleteNote: (noteId: string) => Promise<void>
  publishNote: (noteId: string) => Promise<void>
}

// ============================================================================
// useLocalNotes Hook
// ============================================================================

/**
 * Hook for managing notes in local PGlite database
 */
export function useLocalNotes(options: UseLocalNotesOptions = {}): UseLocalNotesReturn {
  const {
    classId,
    teacherId,
    includeUnpublished = true,
    autoRefresh = false,
    refreshInterval = 30000,
  } = options

  const dbStatus = useDatabaseStatus()
  const queryClient = useQueryClient()

  // Fetch notes from local database
  const { data: notes, isLoading, error, refetch } = useQuery({
    queryKey: ['notes', { classId, teacherId, includeUnpublished }],
    queryFn: async () => {
      if (classId) {
        return localNotesService.getNotesByClass(classId, {
          includeUnpublished,
        })
      }
      if (teacherId) {
        return localNotesService.getNotesByTeacher(teacherId, {
          classId,
          includeUnpublished,
        })
      }
      return []
    },
    enabled: dbStatus.isInitialized,
    refetchInterval: autoRefresh ? refreshInterval : false,
  })

  const saveNoteMutation = useMutation({
    mutationFn: ({ note, details }: { note: NewNote, details?: NewNoteDetail[] }) =>
      localNotesService.saveNoteLocally(note, details),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })

  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, updates, details }: { noteId: string, updates: Partial<NewNote>, details?: NewNoteDetail[] }) =>
      localNotesService.updateNoteLocally(noteId, updates, details),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => localNotesService.deleteNoteLocally(noteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })

  const publishNoteMutation = useMutation({
    mutationFn: (noteId: string) => localNotesService.publishNote(noteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })

  return {
    notes: notes ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refresh: refetch,
    saveNote: (note, details) => saveNoteMutation.mutateAsync({ note, details }),
    updateNote: (noteId, updates, details) => updateNoteMutation.mutateAsync({ noteId, updates, details }),
    deleteNote: noteId => deleteNoteMutation.mutateAsync(noteId),
    publishNote: noteId => publishNoteMutation.mutateAsync(noteId),
  }
}

// ============================================================================
// useNoteGrades Hook
// ============================================================================

export interface UseNoteGradesOptions {
  noteId: string
}

export interface UseNoteGradesReturn {
  grades: Map<string, string>
  isLoading: boolean
  error: string | null
  updateGrade: (studentId: string, value: string) => Promise<void>
  refresh: () => Promise<any>
}

/**
 * Hook for managing grades for a specific note
 */
export function useNoteGrades(options: UseNoteGradesOptions): UseNoteGradesReturn {
  const { noteId } = options
  const dbStatus = useDatabaseStatus()
  const queryClient = useQueryClient()

  const { data: gradesMap, isLoading, error, refetch } = useQuery({
    queryKey: ['notes', noteId, 'grades'],
    queryFn: async () => {
      const noteDetails = await localNotesService.getGradesByNote(noteId)
      const map = new Map<string, string>()
      for (const detail of noteDetails) {
        map.set(detail.studentId, detail.value ?? '0')
      }
      return map
    },
    enabled: dbStatus.isInitialized && !!noteId,
  })

  const updateGradeMutation = useMutation({
    mutationFn: ({ studentId, value }: { studentId: string, value: string }) =>
      localNotesService.updateStudentGrade(noteId, studentId, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', noteId, 'grades'] }),
  })

  return {
    grades: gradesMap ?? new Map(),
    isLoading,
    error: error instanceof Error ? error.message : null,
    updateGrade: (studentId, value) => updateGradeMutation.mutateAsync({ studentId, value }),
    refresh: refetch,
  }
}

// ============================================================================
// useUnpublishedNotes Hook
// ============================================================================

export interface UseUnpublishedNotesReturn {
  unpublishedNotes: NoteWithDetails[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<any>
  publishAll: () => Promise<void>
  clearAfterPublish: (noteIds: string[]) => Promise<void>
}

/**
 * Hook for managing unpublished notes that need syncing
 */
export function useUnpublishedNotes(): UseUnpublishedNotesReturn {
  const dbStatus = useDatabaseStatus()
  const queryClient = useQueryClient()

  const { data: unpublishedNotes, isLoading, error, refetch } = useQuery({
    queryKey: ['notes', 'unpublished'],
    queryFn: () => localNotesService.getUnpublishedNotes(),
    enabled: dbStatus.isInitialized,
  })

  const publishAllMutation = useMutation({
    mutationFn: async (notes: NoteWithDetails[]) => {
      for (const note of notes) {
        await localNotesService.publishNote(note.id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  const clearAfterPublishMutation = useMutation({
    mutationFn: (noteIds: string[]) => localNotesService.clearLocalDataAfterPublish(noteIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  return {
    unpublishedNotes: unpublishedNotes ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refresh: refetch,
    publishAll: () => publishAllMutation.mutateAsync(unpublishedNotes ?? []),
    clearAfterPublish: noteIds => clearAfterPublishMutation.mutateAsync(noteIds),
  }
}
