import { relations } from 'drizzle-orm'
import { boolean, index, integer, jsonb, pgTable, smallint, text, timestamp } from 'drizzle-orm/pg-core'

// --- Level 0: Independent Entities ---

export const schools = pgTable('schools', {
  id: text('id').primaryKey(), // UUID or CUID
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  logoUrl: text('logo_url'),
  status: text('status', { enum: ['active', 'inactive', 'suspended'] }).default('active').notNull(),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const educationLevels = pgTable('education_levels', {
  id: smallint('id').primaryKey(), // 1=Maternelle, 2=Primaire, 3=Secondaire, 4=Supérieur
  name: text('name').notNull().unique(),
  order: smallint('order').notNull(),
})

export const tracks = pgTable('tracks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  educationLevelId: smallint('education_level_id')
    .notNull()
    .references(() => educationLevels.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const tracksRelations = relations(tracks, ({ one }) => ({
  educationLevel: one(educationLevels, {
    fields: [tracks.educationLevelId],
    references: [educationLevels.id],
  }),
}))

// --- Level 1: Catalog Tables ---

export const grades = pgTable('grades', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  order: smallint('order').notNull(),
  trackId: text('track_id')
    .notNull()
    .references(() => tracks.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const gradesRelations = relations(grades, ({ one }) => ({
  track: one(tracks, {
    fields: [grades.trackId],
    references: [tracks.id],
  }),
}))

export const series = pgTable('series', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  trackId: text('track_id')
    .notNull()
    .references(() => tracks.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const seriesRelations = relations(series, ({ one }) => ({
  track: one(tracks, {
    fields: [series.trackId],
    references: [tracks.id],
  }),
}))

export const subjects = pgTable('subjects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  shortName: text('short_name'),
  category: text('category', { enum: ['Scientifique', 'Littéraire', 'Sportif', 'Autre'] }).default('Autre').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// --- Level 2: Template Configuration ---

export const schoolYearTemplates = pgTable('school_year_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g., "2025-2026"
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const termTemplates = pgTable('term_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g., "1er Trimestre"
  type: text('type', { enum: ['trimester', 'semester'] }).notNull(),
  order: smallint('order').notNull(),
  schoolYearTemplateId: text('school_year_template_id')
    .notNull()
    .references(() => schoolYearTemplates.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const termTemplatesRelations = relations(termTemplates, ({ one }) => ({
  schoolYearTemplate: one(schoolYearTemplates, {
    fields: [termTemplates.schoolYearTemplateId],
    references: [schoolYearTemplates.id],
  }),
}))

export const programTemplates = pgTable('program_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  schoolYearTemplateId: text('school_year_template_id')
    .notNull()
    .references(() => schoolYearTemplates.id),
  subjectId: text('subject_id')
    .notNull()
    .references(() => subjects.id),
  gradeId: text('grade_id')
    .notNull()
    .references(() => grades.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).default('draft').notNull(),
})

export const programTemplateChapters = pgTable('program_template_chapters', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  objectives: text('objectives'),
  order: smallint('order').notNull(),
  durationHours: integer('duration_hours'),
  programTemplateId: text('program_template_id')
    .notNull()
    .references(() => programTemplates.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const programTemplatesRelations = relations(programTemplates, ({ one, many }) => ({
  schoolYearTemplate: one(schoolYearTemplates, {
    fields: [programTemplates.schoolYearTemplateId],
    references: [schoolYearTemplates.id],
  }),
  subject: one(subjects, {
    fields: [programTemplates.subjectId],
    references: [subjects.id],
  }),
  grade: one(grades, {
    fields: [programTemplates.gradeId],
    references: [grades.id],
  }),
  chapters: many(programTemplateChapters),
}))

export const programTemplateChaptersRelations = relations(programTemplateChapters, ({ one }) => ({
  programTemplate: one(programTemplates, {
    fields: [programTemplateChapters.programTemplateId],
    references: [programTemplates.id],
  }),
}))

export const programTemplateVersions = pgTable('program_template_versions', {
  id: text('id').primaryKey(),
  programTemplateId: text('program_template_id')
    .notNull()
    .references(() => programTemplates.id),
  versionNumber: integer('version_number').notNull(),
  snapshotData: jsonb('snapshot_data').$type<any>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const programTemplateVersionsRelations = relations(programTemplateVersions, ({ one }) => ({
  programTemplate: one(programTemplates, {
    fields: [programTemplateVersions.programTemplateId],
    references: [programTemplates.id],
  }),
}))

export const coefficientTemplates = pgTable('coefficient_templates', {
  id: text('id').primaryKey(),
  weight: smallint('weight').notNull(),
  schoolYearTemplateId: text('school_year_template_id')
    .notNull()
    .references(() => schoolYearTemplates.id),
  subjectId: text('subject_id')
    .notNull()
    .references(() => subjects.id),
  gradeId: text('grade_id')
    .notNull()
    .references(() => grades.id),
  seriesId: text('series_id').references(() => series.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  // Composite index for fast coefficient lookups during average calculations
  // This is CRITICAL for performance - used thousands of times daily
  coefficientLookupIdx: index('idx_coeff_lookup').on(
    table.schoolYearTemplateId,
    table.gradeId,
    table.seriesId,
    table.subjectId,
  ),
  // Individual indexes for filtering
  yearIdx: index('idx_coeff_year').on(table.schoolYearTemplateId),
  gradeIdx: index('idx_coeff_grade').on(table.gradeId),
  subjectIdx: index('idx_coeff_subject').on(table.subjectId),
}))

export const coefficientTemplatesRelations = relations(coefficientTemplates, ({ one }) => ({
  schoolYearTemplate: one(schoolYearTemplates, {
    fields: [coefficientTemplates.schoolYearTemplateId],
    references: [schoolYearTemplates.id],
  }),
  subject: one(subjects, {
    fields: [coefficientTemplates.subjectId],
    references: [subjects.id],
  }),
  grade: one(grades, {
    fields: [coefficientTemplates.gradeId],
    references: [grades.id],
  }),
  series: one(series, {
    fields: [coefficientTemplates.seriesId],
    references: [series.id],
  }),
}))

// --- Type Exports for Reusability ---

// Full insert types (for explicit ID creation)
export type SchoolInsert = typeof schools.$inferInsert
export type EducationLevelInsert = typeof educationLevels.$inferInsert
export type TrackInsert = typeof tracks.$inferInsert
export type GradeInsert = typeof grades.$inferInsert
export type SerieInsert = typeof series.$inferInsert
export type SubjectInsert = typeof subjects.$inferInsert
export type SchoolYearTemplateInsert = typeof schoolYearTemplates.$inferInsert
export type TermTemplateInsert = typeof termTemplates.$inferInsert
export type ProgramTemplateInsert = typeof programTemplates.$inferInsert
export type ProgramTemplateChapterInsert = typeof programTemplateChapters.$inferInsert
export type ProgramTemplateVersionInsert = typeof programTemplateVersions.$inferInsert
export type CoefficientTemplateInsert = typeof coefficientTemplates.$inferInsert

// Types without auto-generated fields (for data seeding)
export type SchoolData = Omit<SchoolInsert, 'id' | 'createdAt' | 'updatedAt'>
export type TrackData = Omit<TrackInsert, 'id' | 'createdAt' | 'updatedAt'>
export type GradeData = Omit<GradeInsert, 'id' | 'createdAt' | 'updatedAt'>
export type SerieData = Omit<SerieInsert, 'id' | 'createdAt' | 'updatedAt'>
export type SubjectData = Omit<SubjectInsert, 'id' | 'createdAt' | 'updatedAt'>
export type SchoolYearTemplateData = Omit<SchoolYearTemplateInsert, 'id' | 'createdAt' | 'updatedAt'>
export type TermTemplateData = Omit<TermTemplateInsert, 'id' | 'schoolYearTemplateId' | 'createdAt' | 'updatedAt'>
export type ProgramTemplateData = Omit<ProgramTemplateInsert, 'id' | 'schoolYearTemplateId' | 'subjectId' | 'gradeId' | 'createdAt' | 'updatedAt'>
export type ProgramTemplateChapterData = Omit<ProgramTemplateChapterInsert, 'id' | 'programTemplateId' | 'createdAt' | 'updatedAt'>
export type ProgramTemplateVersionData = Omit<ProgramTemplateVersionInsert, 'id' | 'createdAt'>
export type CoefficientTemplateData = Omit<CoefficientTemplateInsert, 'id' | 'schoolYearTemplateId' | 'subjectId' | 'gradeId' | 'seriesId' | 'createdAt' | 'updatedAt'>

// Select types (for querying)
export type School = typeof schools.$inferSelect
export type EducationLevel = typeof educationLevels.$inferSelect
export type Track = typeof tracks.$inferSelect
export type Grade = typeof grades.$inferSelect
export type Serie = typeof series.$inferSelect
export type Subject = typeof subjects.$inferSelect
export type SchoolYearTemplate = typeof schoolYearTemplates.$inferSelect
export type TermTemplate = typeof termTemplates.$inferSelect
export type ProgramTemplate = typeof programTemplates.$inferSelect
export type ProgramTemplateChapter = typeof programTemplateChapters.$inferSelect
export type ProgramTemplateVersion = typeof programTemplateVersions.$inferSelect
export type CoefficientTemplate = typeof coefficientTemplates.$inferSelect

// Enum types for type safety
export type SubjectCategory = 'Scientifique' | 'Littéraire' | 'Sportif' | 'Autre'
export type TermType = 'trimester' | 'semester'
export type SchoolStatus = 'active' | 'inactive' | 'suspended'
export type ProgramStatus = 'draft' | 'published' | 'archived'
