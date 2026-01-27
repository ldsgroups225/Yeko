import type { DB } from './client-db'

// ============================================================================
// Migration SQL Statements
// ============================================================================

const MIGRATION_SQL = `
-- Notes table for offline storage
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  weight INTEGER DEFAULT 1,
  is_graded BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMP,
  is_published BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  class_id TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  school_id TEXT NOT NULL,
  subject_id TEXT,
  school_year_id TEXT,
  term_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_sync_at TIMESTAMP,
  is_dirty BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  conflict_resolution TEXT
);

-- Note details table for individual student grades
CREATE TABLE IF NOT EXISTS note_details (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  value NUMERIC(5, 2) DEFAULT 0,
  graded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_sync_at TIMESTAMP,
  is_dirty BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Sync queue table for managing offline operations
CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY,
  operation TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMP,
  error TEXT,
  status TEXT DEFAULT 'pending'
);

-- User cache table for preferences and cached data
CREATE TABLE IF NOT EXISTS user_cache (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_class_id ON notes(class_id);
CREATE INDEX IF NOT EXISTS idx_notes_teacher_id ON notes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_notes_school_id ON notes(school_id);
CREATE INDEX IF NOT EXISTS idx_notes_is_dirty ON notes(is_dirty);
CREATE INDEX IF NOT EXISTS idx_note_details_note_id ON note_details(note_id);
CREATE INDEX IF NOT EXISTS idx_note_details_student_id ON note_details(student_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at ON sync_queue(created_at);
`

// ============================================================================
// Migration Functions
// ============================================================================

/**
 * Execute migration SQL statements on the database
 * @param db - Database instance
 */
export async function runMigrations(db: DB): Promise<void> {
  try {
    console.warn('🚀 Running database migrations...')

    // Split migration SQL by semicolons and execute each statement
    const statements = MIGRATION_SQL.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)

    for (const statement of statements) {
      if (statement.length > 0) {
        await db.execute(statement)
      }
    }

    console.warn('✅ Database migrations completed successfully')
  }
  catch (error) {
    console.error('❌ Failed to run database migrations:', error)
    throw error
  }
}

/**
 * Initialize database with proper migrations
 * @param db - Database instance
 */
export async function initializeDatabaseWithMigrations(db: DB): Promise<void> {
  try {
    // Check if the database is already initialized by checking if a table exists
    const result = await db.execute(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'notes'
    `)

    // If the notes table doesn't exist, run all migrations
    if (result.rows.length === 0) {
      await runMigrations(db)
    }
    else {
      console.warn('📦 Database already initialized, skipping migrations')
    }
  }
  catch (error) {
    console.error('❌ Failed to initialize database with migrations:', error)
    throw error
  }
}

/**
 * Check if migrations are needed
 * @param db - Database instance
 * @returns boolean indicating if migrations are needed
 */
export async function checkMigrationsNeeded(db: DB): Promise<boolean> {
  try {
    const result = await db.execute(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'notes'
    `)
    return result.rows.length === 0
  }
  catch {
    return true
  }
}
