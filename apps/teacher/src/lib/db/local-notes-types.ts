import type { Note, NoteDetail } from './schema'

export interface NoteWithDetails extends Note {
  details: NoteDetail[]
}
