import type { DB } from './client-db'
import { and, eq, inArray } from 'drizzle-orm'
import {
  noteDetailsTable,
  notesTable,
  syncQueueTable,
} from './schema'

export async function removeSyncQueueEntriesForPublishedNote(
  db: DB,
  noteId: string,
): Promise<void> {
  const details = await db
    .select({ id: noteDetailsTable.id })
    .from(noteDetailsTable)
    .where(eq(noteDetailsTable.noteId, noteId))

  const detailIds = details.map(detail => detail.id)

  await db
    .delete(syncQueueTable)
    .where(
      and(
        eq(syncQueueTable.tableName, 'notes'),
        eq(syncQueueTable.recordId, noteId),
      ),
    )

  if (detailIds.length > 0) {
    await db
      .delete(syncQueueTable)
      .where(
        and(
          eq(syncQueueTable.tableName, 'note_details'),
          inArray(syncQueueTable.recordId, detailIds),
        ),
      )
  }
}

export async function getActionablePendingSyncCount(db: DB): Promise<number> {
  const pendingItems = await db
    .select()
    .from(syncQueueTable)
    .where(eq(syncQueueTable.status, 'pending'))

  const actionableNoteIds = new Set<string>()
  const noteActionableCache = new Map<string, boolean>()
  const detailToNoteCache = new Map<string, string | null>()

  const isNoteActionable = async (noteId: string): Promise<boolean> => {
    const cached = noteActionableCache.get(noteId)
    if (cached !== undefined) {
      return cached
    }

    const note = await db
      .select({
        id: notesTable.id,
        isDirty: notesTable.isDirty,
        isDeleted: notesTable.isDeleted,
      })
      .from(notesTable)
      .where(eq(notesTable.id, noteId))
      .limit(1)

    const noteRecord = note[0]
    if (!noteRecord || noteRecord.isDeleted || !noteRecord.isDirty) {
      noteActionableCache.set(noteId, false)
      return false
    }

    const details = await db
      .select({ id: noteDetailsTable.id })
      .from(noteDetailsTable)
      .where(
        and(
          eq(noteDetailsTable.noteId, noteId),
          eq(noteDetailsTable.isDeleted, false),
        ),
      )
      .limit(1)

    const actionable = details.length > 0
    noteActionableCache.set(noteId, actionable)
    return actionable
  }

  for (const item of pendingItems) {
    let noteId: string | null = null

    if (item.tableName === 'notes') {
      noteId = item.recordId
    }
    else if (item.tableName === 'note_details') {
      const cached = detailToNoteCache.get(item.recordId)
      if (cached !== undefined) {
        noteId = cached
      }
      else {
        const detail = await db
          .select({
            noteId: noteDetailsTable.noteId,
          })
          .from(noteDetailsTable)
          .where(
            and(
              eq(noteDetailsTable.id, item.recordId),
              eq(noteDetailsTable.isDeleted, false),
            ),
          )
          .limit(1)

        noteId = detail[0]?.noteId ?? null
        detailToNoteCache.set(item.recordId, noteId)
      }
    }

    if (!noteId || actionableNoteIds.has(noteId)) {
      continue
    }

    if (await isNoteActionable(noteId)) {
      actionableNoteIds.add(noteId)
    }
  }

  return actionableNoteIds.size
}
