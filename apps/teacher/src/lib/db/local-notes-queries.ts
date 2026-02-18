import type { NoteWithDetails } from './local-notes-types'
import type { Note, NoteDetail } from './schema'
import { and, desc, eq } from 'drizzle-orm'
import { clientDatabaseManager } from './client-db'
import {
  noteDetailsTable,
  notesTable,
} from './schema'

async function getDb() {
  return clientDatabaseManager.getDb()
}
export async function getNoteById(noteId: string): Promise<NoteWithDetails | null> {
  try {
    if (!clientDatabaseManager.isReady()) {
      throw new Error('Database is not ready for use')
    }

    const db = await getDb()

    const notes = await db
      .select()
      .from(notesTable)
      .where(and(eq(notesTable.id, noteId), eq(notesTable.isDeleted, false)))
      .limit(1)

    if (notes.length === 0) {
      return null
    }

    const details = await db
      .select()
      .from(noteDetailsTable)
      .where(
        and(
          eq(noteDetailsTable.noteId, noteId),
          eq(noteDetailsTable.isDeleted, false),
        ),
      )

    const note = notes[0]
    if (!note || !note.id) {
      return null
    }

    return {
      ...note,
      id: note.id,
      details,
    } as NoteWithDetails
  }
  catch (error) {
    throw new Error(
      `Failed to get note: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export async function findNote(params: {
  classId: string
  subjectId: string
  termId: string
  type: string
  teacherId: string
}): Promise<NoteWithDetails | null> {
  const db = await getDb()
  const result = await db
    .select()
    .from(notesTable)
    .where(
      and(
        eq(notesTable.classId, params.classId),
        eq(notesTable.subjectId, params.subjectId),
        eq(notesTable.termId, params.termId),
        eq(notesTable.type, params.type),
        eq(notesTable.teacherId, params.teacherId),
        eq(notesTable.isDeleted, false),
      ),
    )
    .limit(1)

  if (result.length === 0)
    return null
  return getNoteById(result[0]!.id)
}

export async function getNotesByClass(
  classId: string,
  options?: { includeUnpublished?: boolean },
): Promise<Note[]> {
  try {
    if (!clientDatabaseManager.isReady()) {
      throw new Error('Database is not ready for use')
    }

    const db = await getDb()

    const conditions = [
      eq(notesTable.classId, classId),
      eq(notesTable.isDeleted, false),
    ]

    if (!options?.includeUnpublished) {
      conditions.push(eq(notesTable.isPublished, true))
    }

    return await db
      .select()
      .from(notesTable)
      .where(and(...conditions))
      .orderBy(desc(notesTable.createdAt))
  }
  catch (error) {
    throw new Error(
      `Failed to get notes by class: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export async function getNotesByTeacher(
  teacherId: string,
  options?: { classId?: string, includeUnpublished?: boolean },
): Promise<Note[]> {
  try {
    if (!clientDatabaseManager.isReady()) {
      throw new Error('Database is not ready for use')
    }

    const db = await getDb()

    const conditions = [
      eq(notesTable.teacherId, teacherId),
      eq(notesTable.isDeleted, false),
    ]

    if (options?.classId) {
      conditions.push(eq(notesTable.classId, options.classId))
    }

    if (!options?.includeUnpublished) {
      conditions.push(eq(notesTable.isPublished, true))
    }

    return await db
      .select()
      .from(notesTable)
      .where(and(...conditions))
      .orderBy(desc(notesTable.createdAt))
  }
  catch (error) {
    throw new Error(
      `Failed to get notes by teacher: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export async function getUnpublishedNotes(): Promise<NoteWithDetails[]> {
  try {
    if (!clientDatabaseManager.isReady()) {
      throw new Error('Database is not ready for use')
    }

    const db = await getDb()

    const dirtyNotes = await db
      .select()
      .from(notesTable)
      .where(
        and(eq(notesTable.isDirty, true), eq(notesTable.isDeleted, false)),
      )
      .orderBy(desc(notesTable.createdAt))

    const notesWithDetails: NoteWithDetails[] = []

    for (const note of dirtyNotes) {
      const details = await db
        .select()
        .from(noteDetailsTable)
        .where(
          and(
            eq(noteDetailsTable.noteId, note.id),
            eq(noteDetailsTable.isDeleted, false),
          ),
        )

      notesWithDetails.push({
        ...note,
        details,
      })
    }

    return notesWithDetails
  }
  catch (error) {
    throw new Error(
      `Failed to get unpublished notes: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export async function findUnpublishedNote(params: {
  classId: string
  schoolId: string
  subjectId?: string
  teacherId: string
}): Promise<NoteWithDetails | null> {
  try {
    if (!clientDatabaseManager.isReady()) {
      return null
    }

    const db = await getDb()
    const conditions = [
      eq(notesTable.classId, params.classId),
      eq(notesTable.schoolId, params.schoolId),
      eq(notesTable.teacherId, params.teacherId),
      eq(notesTable.isPublished, false),
      eq(notesTable.isDeleted, false),
    ]

    if (params.subjectId) {
      conditions.push(eq(notesTable.subjectId, params.subjectId))
    }

    const result = await db
      .select()
      .from(notesTable)
      .where(and(...conditions))
      .orderBy(desc(notesTable.updatedAt))
      .limit(1)

    if (result.length === 0)
      return null

    return getNoteById(result[0]!.id)
  }
  catch (error) {
    console.error('Failed to find unpublished note:', error)
    return null
  }
}

export async function countUnpublishedNotes(params: {
  classId: string
  schoolId: string
  teacherId: string
}): Promise<number> {
  try {
    if (!clientDatabaseManager.isReady()) {
      return 0
    }

    const db = await getDb()
    const result = await db
      .select()
      .from(notesTable)
      .where(
        and(
          eq(notesTable.classId, params.classId),
          eq(notesTable.schoolId, params.schoolId),
          eq(notesTable.teacherId, params.teacherId),
          eq(notesTable.isPublished, false),
          eq(notesTable.isDeleted, false),
        ),
      )

    return result.length
  }
  catch (error) {
    console.error('Failed to count unpublished notes:', error)
    return 0
  }
}

export async function getGradesByNote(noteId: string): Promise<NoteDetail[]> {
  try {
    if (!clientDatabaseManager.isReady()) {
      throw new Error('Database is not ready for use')
    }

    const db = await getDb()

    return await db
      .select()
      .from(noteDetailsTable)
      .where(
        and(
          eq(noteDetailsTable.noteId, noteId),
          eq(noteDetailsTable.isDeleted, false),
        ),
      )
  }
  catch (error) {
    throw new Error(
      `Failed to get grades by note: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
