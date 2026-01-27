'use client'

import type { NoteWithDetails } from '../lib/db/local-notes'
import type { NewNote, NewNoteDetail, Note } from '../lib/db/schema'
import { useCallback, useEffect, useRef, useState } from 'react'
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
  refresh: () => Promise<void>
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

  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dbStatus = useDatabaseStatus()
  const mountedRef = useRef(true)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch notes from local database
  const fetchNotes = useCallback(async () => {
    if (!dbStatus.isInitialized) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let fetchedNotes: Note[]

      if (classId) {
        fetchedNotes = await localNotesService.getNotesByClass(classId, {
          includeUnpublished,
        })
      }
      else if (teacherId) {
        fetchedNotes = await localNotesService.getNotesByTeacher(teacherId, {
          classId,
          includeUnpublished,
        })
      }
      else {
        fetchedNotes = []
      }

      if (mountedRef.current) {
        setNotes(fetchedNotes)
      }
    }
    catch (err) {
      if (mountedRef.current) {
        const errorMessage
          = err instanceof Error ? err.message : 'Failed to fetch notes'
        setError(errorMessage)
        console.error('Failed to fetch notes:', err)
      }
    }
    finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [dbStatus.isInitialized, classId, teacherId, includeUnpublished])

  // Save a new note
  const saveNote = useCallback(
    async (note: NewNote, details?: NewNoteDetail[]) => {
      try {
        await localNotesService.saveNoteLocally(note, details)
        await fetchNotes()
      }
      catch (err) {
        const errorMessage
          = err instanceof Error ? err.message : 'Failed to save note'
        setError(errorMessage)
        throw err
      }
    },
    [fetchNotes],
  )

  // Update an existing note
  const updateNote = useCallback(
    async (
      noteId: string,
      updates: Partial<NewNote>,
      details?: NewNoteDetail[],
    ) => {
      try {
        await localNotesService.updateNoteLocally(noteId, updates, details)
        await fetchNotes()
      }
      catch (err) {
        const errorMessage
          = err instanceof Error ? err.message : 'Failed to update note'
        setError(errorMessage)
        throw err
      }
    },
    [fetchNotes],
  )

  // Delete a note
  const deleteNote = useCallback(
    async (noteId: string) => {
      try {
        await localNotesService.deleteNoteLocally(noteId)
        await fetchNotes()
      }
      catch (err) {
        const errorMessage
          = err instanceof Error ? err.message : 'Failed to delete note'
        setError(errorMessage)
        throw err
      }
    },
    [fetchNotes],
  )

  // Publish a note
  const publishNote = useCallback(
    async (noteId: string) => {
      try {
        await localNotesService.publishNote(noteId)
        await fetchNotes()
      }
      catch (err) {
        const errorMessage
          = err instanceof Error ? err.message : 'Failed to publish note'
        setError(errorMessage)
        throw err
      }
    },
    [fetchNotes],
  )

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0)
      return

    const scheduleRefresh = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }

      refreshTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && dbStatus.isInitialized) {
          fetchNotes()
          scheduleRefresh()
        }
      }, refreshInterval)
    }

    scheduleRefresh()

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [autoRefresh, refreshInterval, fetchNotes, dbStatus.isInitialized])

  // Initial fetch
  useEffect(() => {
    if (dbStatus.isInitialized) {
      fetchNotes()
    }
  }, [fetchNotes, dbStatus.isInitialized])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  return {
    notes,
    isLoading,
    error,
    refresh: fetchNotes,
    saveNote,
    updateNote,
    deleteNote,
    publishNote,
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
  refresh: () => Promise<void>
}

/**
 * Hook for managing grades for a specific note
 */
export function useNoteGrades(options: UseNoteGradesOptions): UseNoteGradesReturn {
  const { noteId } = options

  const [grades, setGrades] = useState<Map<string, string>>(() => new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dbStatus = useDatabaseStatus()

  // Fetch grades for the note
  const fetchGrades = useCallback(async () => {
    if (!dbStatus.isInitialized || !noteId) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const noteDetails = await localNotesService.getGradesByNote(noteId)
      const gradesMap = new Map<string, string>()

      for (const detail of noteDetails) {
        gradesMap.set(detail.studentId, detail.value ?? '0')
      }

      setGrades(gradesMap)
    }
    catch (err) {
      const errorMessage
        = err instanceof Error ? err.message : 'Failed to fetch grades'
      setError(errorMessage)
      console.error('Failed to fetch grades:', err)
    }
    finally {
      setIsLoading(false)
    }
  }, [dbStatus.isInitialized, noteId])

  // Update a student's grade
  const updateGrade = useCallback(
    async (studentId: string, value: string) => {
      try {
        await localNotesService.updateStudentGrade(noteId, studentId, value)

        // Optimistically update local state
        setGrades((prev) => {
          const newGrades = new Map(prev)
          newGrades.set(studentId, value)
          return newGrades
        })
      }
      catch (err) {
        const errorMessage
          = err instanceof Error ? err.message : 'Failed to update grade'
        setError(errorMessage)
        throw err
      }
    },
    [noteId],
  )

  // Initial fetch
  useEffect(() => {
    if (dbStatus.isInitialized) {
      fetchGrades()
    }
  }, [fetchGrades, dbStatus.isInitialized])

  return {
    grades,
    isLoading,
    error,
    updateGrade,
    refresh: fetchGrades,
  }
}

// ============================================================================
// useUnpublishedNotes Hook
// ============================================================================

export interface UseUnpublishedNotesReturn {
  unpublishedNotes: NoteWithDetails[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  publishAll: () => Promise<void>
  clearAfterPublish: (noteIds: string[]) => Promise<void>
}

/**
 * Hook for managing unpublished notes that need syncing
 */
export function useUnpublishedNotes(): UseUnpublishedNotesReturn {
  const [unpublishedNotes, setUnpublishedNotes] = useState<NoteWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dbStatus = useDatabaseStatus()

  // Fetch unpublished notes
  const fetchUnpublishedNotes = useCallback(async () => {
    if (!dbStatus.isInitialized) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const notes = await localNotesService.getUnpublishedNotes()
      setUnpublishedNotes(notes)
    }
    catch (err) {
      const errorMessage
        = err instanceof Error ? err.message : 'Failed to fetch unpublished notes'
      setError(errorMessage)
      console.error('Failed to fetch unpublished notes:', err)
    }
    finally {
      setIsLoading(false)
    }
  }, [dbStatus.isInitialized])

  // Publish all unpublished notes
  const publishAll = useCallback(async () => {
    try {
      for (const note of unpublishedNotes) {
        await localNotesService.publishNote(note.id)
      }
      await fetchUnpublishedNotes()
    }
    catch (err) {
      const errorMessage
        = err instanceof Error ? err.message : 'Failed to publish notes'
      setError(errorMessage)
      throw err
    }
  }, [unpublishedNotes, fetchUnpublishedNotes])

  // Clear local data after successful publish
  const clearAfterPublish = useCallback(
    async (noteIds: string[]) => {
      try {
        await localNotesService.clearLocalDataAfterPublish(noteIds)
        await fetchUnpublishedNotes()
      }
      catch (err) {
        const errorMessage
          = err instanceof Error ? err.message : 'Failed to clear local data'
        setError(errorMessage)
        throw err
      }
    },
    [fetchUnpublishedNotes],
  )

  // Initial fetch
  useEffect(() => {
    if (dbStatus.isInitialized) {
      fetchUnpublishedNotes()
    }
  }, [fetchUnpublishedNotes, dbStatus.isInitialized])

  return {
    unpublishedNotes,
    isLoading,
    error,
    refresh: fetchUnpublishedNotes,
    publishAll,
    clearAfterPublish,
  }
}
