import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

// ============================================================================
// Notes Table - For offline storage of grade notes
// ============================================================================
export const notesTable = pgTable(
  'notes',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    type: text('type').notNull(), // WRITING_QUESTION, CLASS_TEST, etc.
    totalPoints: integer('total_points').default(0),
    weight: integer('weight').default(1),
    isGraded: boolean('is_graded').default(false),
    dueDate: timestamp('due_date'),
    isPublished: boolean('is_published').default(false),
    isActive: boolean('is_active').default(true),
    classId: text('class_id').notNull(),
    teacherId: text('teacher_id').notNull(),
    schoolId: text('school_id').notNull(),
    subjectId: text('subject_id'),
    schoolYearId: text('school_year_id'),
    termId: text('term_id'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    lastSyncAt: timestamp('last_sync_at'),
    // Offline-specific fields
    isDirty: boolean('is_dirty').default(false), // Needs sync
    isDeleted: boolean('is_deleted').default(false), // Soft delete
    conflictResolution: text('conflict_resolution'), // For conflict handling
  },
  table => ({
    classIdIdx: index('idx_notes_class_id').on(table.classId),
    teacherIdIdx: index('idx_notes_teacher_id').on(table.teacherId),
    schoolIdIdx: index('idx_notes_school_id').on(table.schoolId),
    isDirtyIdx: index('idx_notes_is_dirty').on(table.isDirty),
  }),
)

// ============================================================================
// Note Details Table - Individual student grades within a note
// ============================================================================
export const noteDetailsTable = pgTable(
  'note_details',
  {
    id: text('id').primaryKey(),
    noteId: text('note_id')
      .notNull()
      .references(() => notesTable.id, { onDelete: 'cascade' }),
    studentId: text('student_id').notNull(),
    value: numeric('value', { precision: 5, scale: 2 }).default('0'),
    gradedAt: timestamp('graded_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    lastSyncAt: timestamp('last_sync_at'),
    // Offline-specific fields
    isDirty: boolean('is_dirty').default(false),
    isDeleted: boolean('is_deleted').default(false),
  },
  table => ({
    noteIdIdx: index('idx_note_details_note_id').on(table.noteId),
    studentIdIdx: index('idx_note_details_student_id').on(table.studentId),
  }),
)

// ============================================================================
// Sync Queue Table - Manages offline operations to be synced
// ============================================================================
export const syncQueueTable = pgTable(
  'sync_queue',
  {
    id: text('id').primaryKey(),
    operation: text('operation').notNull(), // 'create', 'update', 'delete'
    tableName: text('table_name').notNull(),
    recordId: text('record_id').notNull(),
    data: text('data'), // JSON string of the data
    createdAt: timestamp('created_at').defaultNow(),
    attempts: integer('attempts').default(0),
    lastAttempt: timestamp('last_attempt'),
    error: text('error'),
    status: text('status').default('pending'), // 'pending', 'processing', 'completed', 'failed'
  },
  table => ({
    statusIdx: index('idx_sync_queue_status').on(table.status),
    createdAtIdx: index('idx_sync_queue_created_at').on(table.createdAt),
  }),
)

// ============================================================================
// User Cache Table - Preferences and cached data
// ============================================================================
export const userCacheTable = pgTable('user_cache', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  key: text('key').notNull(),
  value: text('value'), // JSON string
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ============================================================================
// Export Types
// ============================================================================
export type Note = typeof notesTable.$inferSelect
export type NewNote = typeof notesTable.$inferInsert
export type NoteDetail = typeof noteDetailsTable.$inferSelect
export type NewNoteDetail = typeof noteDetailsTable.$inferInsert
export type SyncQueueItem = typeof syncQueueTable.$inferSelect
export type NewSyncQueueItem = typeof syncQueueTable.$inferInsert
export type UserCache = typeof userCacheTable.$inferSelect
export type NewUserCache = typeof userCacheTable.$inferInsert
