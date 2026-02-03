import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, count, desc, eq, inArray, like, sql } from 'drizzle-orm'

import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import {
  grades,
  programTemplateChapters,
  programTemplates,
  programTemplateVersions,
  schoolYearTemplates,
  subjects,
  termTemplates,
} from '../drizzle/core-schema'
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

interface ProgramSnapshot {
  program: {
    name: string
    subjectId: string
    gradeId: string
    schoolYearTemplateId: string
  }
  chapters: {
    title: string
    objectives: string | null
    order: number
    durationHours: number | null
  }[]
}

type ProgramWithDetails = typeof programTemplates.$inferSelect & {
  schoolYearTemplate: Pick<typeof schoolYearTemplates.$inferSelect, 'id' | 'name' | 'isActive'> | null
  subject: Pick<typeof subjects.$inferSelect, 'id' | 'name' | 'shortName' | 'category'> | null
  grade: Pick<typeof grades.$inferSelect, 'id' | 'name' | 'code' | 'order'> | null
}

// ===== SCHOOL YEAR TEMPLATES =====

export function getSchoolYearTemplates(): ResultAsync<typeof schoolYearTemplates.$inferSelect[], DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(schoolYearTemplates)
      .orderBy(desc(schoolYearTemplates.isActive), desc(schoolYearTemplates.name)),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'fetchSchoolYearTemplatesFailed')),
  ).mapErr(tapLogErr(databaseLogger, {}))
}

export function getSchoolYearTemplateById(id: string): ResultAsync<typeof schoolYearTemplates.$inferSelect | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(schoolYearTemplates)
      .where(eq(schoolYearTemplates.id, id))
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'fetchSchoolYearTemplateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function createSchoolYearTemplate(
  data: Omit<typeof schoolYearTemplates.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): ResultAsync<typeof schoolYearTemplates.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .insert(schoolYearTemplates)
      .values({
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .then(rows => rows[0]!),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'createSchoolYearTemplateFailed')),
  ).mapErr(tapLogErr(databaseLogger, data))
}

export function updateSchoolYearTemplate(
  id: string,
  data: Partial<Omit<typeof schoolYearTemplates.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
): ResultAsync<typeof schoolYearTemplates.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .update(schoolYearTemplates)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schoolYearTemplates.id, id))
      .returning()
      .then((rows) => {
        if (rows.length === 0) {
          throw new Error(`School year template with id ${id} not found`)
        }
        return rows[0]!
      }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'updateSchoolYearTemplateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id, ...data }))
}

export function deleteSchoolYearTemplate(id: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.delete(schoolYearTemplates).where(eq(schoolYearTemplates.id, id)).then(() => {}),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'deleteSchoolYearTemplateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

// ===== PROGRAM TEMPLATES =====

export function getProgramTemplates(options?: {
  schoolYearTemplateId?: string
  subjectId?: string
  gradeId?: string
  search?: string
  status?: 'draft' | 'published' | 'archived'
  page?: number
  limit?: number
}): ResultAsync<{
  programs: ProgramWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}, DatabaseError> {
  const db = getDb()
  const { schoolYearTemplateId, subjectId, gradeId, search, page = 1, limit = 20 } = options || {}
  const offset = (page - 1) * limit

  const conditions = []

  if (schoolYearTemplateId) {
    conditions.push(eq(programTemplates.schoolYearTemplateId, schoolYearTemplateId))
  }

  if (subjectId) {
    conditions.push(eq(programTemplates.subjectId, subjectId))
  }

  if (gradeId) {
    conditions.push(eq(programTemplates.gradeId, gradeId))
  }

  if (search) {
    conditions.push(like(programTemplates.name, `%${search}%`))
  }

  if (options?.status) {
    conditions.push(eq(programTemplates.status, options.status))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  return ResultAsync.fromPromise(
    Promise.all([
      db.select({ count: count() }).from(programTemplates).where(whereClause),
      db
        .select({
          id: programTemplates.id,
          name: programTemplates.name,
          schoolYearTemplateId: programTemplates.schoolYearTemplateId,
          subjectId: programTemplates.subjectId,
          gradeId: programTemplates.gradeId,
          status: programTemplates.status,
          createdAt: programTemplates.createdAt,
          updatedAt: programTemplates.updatedAt,
          schoolYearTemplate: {
            id: schoolYearTemplates.id,
            name: schoolYearTemplates.name,
            isActive: schoolYearTemplates.isActive,
          },
          subject: {
            id: subjects.id,
            name: subjects.name,
            shortName: subjects.shortName,
            category: subjects.category,
          },
          grade: {
            id: grades.id,
            name: grades.name,
            code: grades.code,
            order: grades.order,
          },
        })
        .from(programTemplates)
        .leftJoin(schoolYearTemplates, eq(programTemplates.schoolYearTemplateId, schoolYearTemplates.id))
        .leftJoin(subjects, eq(programTemplates.subjectId, subjects.id))
        .leftJoin(grades, eq(programTemplates.gradeId, grades.id))
        .where(whereClause)
        .orderBy(desc(programTemplates.createdAt))
        .limit(limit)
        .offset(offset),
    ]).then(([countResult, programs]) => {
      const total = countResult[0]?.count || 0
      return {
        programs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'fetchProgramTemplatesFailed')),
  ).mapErr(tapLogErr(databaseLogger, options || {}))
}

export function getProgramTemplateById(id: string): ResultAsync<ProgramWithDetails | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select({
        id: programTemplates.id,
        name: programTemplates.name,
        schoolYearTemplateId: programTemplates.schoolYearTemplateId,
        subjectId: programTemplates.subjectId,
        gradeId: programTemplates.gradeId,
        status: programTemplates.status,
        createdAt: programTemplates.createdAt,
        updatedAt: programTemplates.updatedAt,
        schoolYearTemplate: {
          id: schoolYearTemplates.id,
          name: schoolYearTemplates.name,
          isActive: schoolYearTemplates.isActive,
        },
        subject: {
          id: subjects.id,
          name: subjects.name,
          shortName: subjects.shortName,
          category: subjects.category,
        },
        grade: {
          id: grades.id,
          name: grades.name,
          code: grades.code,
          order: grades.order,
        },
      })
      .from(programTemplates)
      .leftJoin(schoolYearTemplates, eq(programTemplates.schoolYearTemplateId, schoolYearTemplates.id))
      .leftJoin(subjects, eq(programTemplates.subjectId, subjects.id))
      .leftJoin(grades, eq(programTemplates.gradeId, grades.id))
      .where(eq(programTemplates.id, id))
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'fetchProgramTemplateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function createProgramTemplate(
  data: Omit<typeof programTemplates.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): ResultAsync<typeof programTemplates.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .insert(programTemplates)
      .values({
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .then(rows => rows[0]!),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'createProgramTemplateFailed')),
  ).mapErr(tapLogErr(databaseLogger, data))
}

export function updateProgramTemplate(
  id: string,
  data: Partial<Omit<typeof programTemplates.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
): ResultAsync<typeof programTemplates.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .update(programTemplates)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(programTemplates.id, id))
      .returning()
      .then((rows) => {
        if (rows.length === 0) {
          throw new Error(`Program template with id ${id} not found`)
        }
        return rows[0]!
      }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'updateProgramTemplateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id, ...data }))
}

export function deleteProgramTemplate(id: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      // Delete chapters first (cascade)
      await tx.delete(programTemplateChapters).where(eq(programTemplateChapters.programTemplateId, id))
      // Then delete program
      await tx.delete(programTemplates).where(eq(programTemplates.id, id))
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'deleteProgramTemplateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function cloneProgramTemplate(id: string, newSchoolYearTemplateId: string, newName: string): ResultAsync<typeof programTemplates.$inferSelect, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      // Get original program
      const [original] = await tx
        .select()
        .from(programTemplates)
        .where(eq(programTemplates.id, id))

      if (!original) {
        throw new Error(`Program template with id ${id} not found`)
      }

      // Get original chapters
      const originalChapters = await tx
        .select()
        .from(programTemplateChapters)
        .where(eq(programTemplateChapters.programTemplateId, id))
        .orderBy(asc(programTemplateChapters.order))

      // Create new program
      const newProgramId = crypto.randomUUID()
      const [newProgram] = await tx
        .insert(programTemplates)
        .values({
          id: newProgramId,
          name: newName,
          schoolYearTemplateId: newSchoolYearTemplateId,
          subjectId: original.subjectId,
          gradeId: original.gradeId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      // Clone chapters
      if (originalChapters.length > 0) {
        const newChapters = originalChapters.map(chapter => ({
          id: crypto.randomUUID(),
          title: chapter.title,
          objectives: chapter.objectives,
          order: chapter.order,
          durationHours: chapter.durationHours,
          programTemplateId: newProgramId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))

        await tx.insert(programTemplateChapters).values(newChapters)
      }

      return newProgram!
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'cloneProgramTemplateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id, newSchoolYearTemplateId, newName }))
}

// ===== PROGRAM TEMPLATE CHAPTERS =====

export function getProgramTemplateChapters(programTemplateId: string): ResultAsync<typeof programTemplateChapters.$inferSelect[], DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(programTemplateChapters)
      .where(eq(programTemplateChapters.programTemplateId, programTemplateId))
      .orderBy(asc(programTemplateChapters.order)),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'fetchProgramTemplateChaptersFailed')),
  ).mapErr(tapLogErr(databaseLogger, { programTemplateId }))
}

export function getProgramTemplateChapterById(id: string): ResultAsync<typeof programTemplateChapters.$inferSelect | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(programTemplateChapters)
      .where(eq(programTemplateChapters.id, id))
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'fetchProgramTemplateChapterFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function createProgramTemplateChapter(
  data: Omit<typeof programTemplateChapters.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): ResultAsync<typeof programTemplateChapters.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .insert(programTemplateChapters)
      .values({
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .then(rows => rows[0]!),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'createProgramTemplateChapterFailed')),
  ).mapErr(tapLogErr(databaseLogger, data))
}

export function updateProgramTemplateChapter(
  id: string,
  data: Partial<Omit<typeof programTemplateChapters.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
): ResultAsync<typeof programTemplateChapters.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .update(programTemplateChapters)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(programTemplateChapters.id, id))
      .returning()
      .then((rows) => {
        if (rows.length === 0) {
          throw new Error(`Program template chapter with id ${id} not found`)
        }
        return rows[0]!
      }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'updateProgramTemplateChapterFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id, ...data }))
}

export function deleteProgramTemplateChapter(id: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.delete(programTemplateChapters).where(eq(programTemplateChapters.id, id)).then(() => {}),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'deleteProgramTemplateChapterFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function bulkUpdateChaptersOrder(items: { id: string, order: number }[]): ResultAsync<void, DatabaseError> {
  const db = getDb()
  if (items.length === 0)
    return ResultAsync.fromPromise(Promise.resolve(), err => DatabaseError.from(err))

  const ids = items.map(i => i.id)

  return ResultAsync.fromPromise(
    db.update(programTemplateChapters)
      .set({
        order: sql`CASE 
          ${sql.join(
            items.map(item => sql`WHEN id = ${item.id} THEN ${item.order}::integer`),
            sql` `,
          )} 
        END`,
        updatedAt: new Date(),
      })
      .where(inArray(programTemplateChapters.id, ids))
      .then(() => {}),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'bulkUpdateChaptersOrderFailed')),
  ).mapErr(tapLogErr(databaseLogger, { items }))
}

export function bulkCreateChapters(
  programTemplateId: string,
  chapters: {
    title: string
    objectives?: string | null
    order?: number
    durationHours?: number | null
  }[],
): ResultAsync<typeof programTemplateChapters.$inferSelect[], DatabaseError> {
  const db = getDb()
  if (chapters.length === 0)
    return ResultAsync.fromPromise(Promise.resolve([]), err => DatabaseError.from(err))

  const values = chapters.map((chapter, index) => ({
    id: crypto.randomUUID(),
    ...chapter,
    order: chapter.order || index + 1,
    programTemplateId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  return ResultAsync.fromPromise(
    db
      .insert(programTemplateChapters)
      .values(values)
      .returning(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'bulkCreateChaptersFailed')),
  ).mapErr(tapLogErr(databaseLogger, { programTemplateId, chapters }))
}

// ===== PROGRAM VERSIONS =====

export function publishProgram(id: string): ResultAsync<{ success: true, version: number }, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      // 1. Get current program and chapters
      const [program] = await tx
        .select({
          id: programTemplates.id,
          name: programTemplates.name,
          schoolYearTemplateId: programTemplates.schoolYearTemplateId,
          subjectId: programTemplates.subjectId,
          gradeId: programTemplates.gradeId,
        })
        .from(programTemplates)
        .where(eq(programTemplates.id, id))

      if (!program) {
        throw new Error(`Program template with id ${id} not found`)
      }

      const chapters = await tx
        .select()
        .from(programTemplateChapters)
        .where(eq(programTemplateChapters.programTemplateId, id))
        .orderBy(asc(programTemplateChapters.order))

      // 2. Create snapshot
      const snapshot: ProgramSnapshot = {
        program: {
          name: program.name,
          subjectId: program.subjectId,
          gradeId: program.gradeId,
          schoolYearTemplateId: program.schoolYearTemplateId,
        },
        chapters: chapters.map(c => ({
          title: c.title,
          objectives: c.objectives,
          order: c.order,
          durationHours: c.durationHours,
        })),
      }

      // 3. Get next version number
      const [lastVersion] = await tx
        .select()
        .from(programTemplateVersions)
        .where(eq(programTemplateVersions.programTemplateId, id))
        .orderBy(desc(programTemplateVersions.versionNumber))
        .limit(1)

      const nextVersion = (lastVersion?.versionNumber || 0) + 1

      // 4. Update status + Create version
      await tx
        .update(programTemplates)
        .set({
          status: 'published',
          updatedAt: new Date(),
        })
        .where(eq(programTemplates.id, id))

      await tx.insert(programTemplateVersions).values({
        id: crypto.randomUUID(),
        programTemplateId: id,
        versionNumber: nextVersion,
        snapshotData: snapshot,
        createdAt: new Date(),
      })

      return { success: true as const, version: nextVersion }
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'publishProgramFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function getProgramVersions(programTemplateId: string): ResultAsync<typeof programTemplateVersions.$inferSelect[], DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(programTemplateVersions)
      .where(eq(programTemplateVersions.programTemplateId, programTemplateId))
      .orderBy(desc(programTemplateVersions.versionNumber)),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'fetchProgramVersionsFailed')),
  ).mapErr(tapLogErr(databaseLogger, { programTemplateId }))
}

export function restoreProgramVersion(versionId: string): ResultAsync<{ success: true }, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      // 1. Get version snapshot
      const [version] = await tx
        .select()
        .from(programTemplateVersions)
        .where(eq(programTemplateVersions.id, versionId))

      if (!version) {
        throw new Error(`Version with id ${versionId} not found`)
      }

      const snapshot = version.snapshotData as unknown as ProgramSnapshot
      const programId = version.programTemplateId

      // 2. Restore program + Replace chapters
      // Restore program fields
      await tx
        .update(programTemplates)
        .set({
          name: snapshot.program.name,
          subjectId: snapshot.program.subjectId,
          gradeId: snapshot.program.gradeId,
          schoolYearTemplateId: snapshot.program.schoolYearTemplateId,
          status: 'draft', // Revert to draft on restore
          updatedAt: new Date(),
        })
        .where(eq(programTemplates.id, programId))

      // Delete existing chapters
      await tx
        .delete(programTemplateChapters)
        .where(eq(programTemplateChapters.programTemplateId, programId))

      // Insert snapshot chapters
      if (snapshot.chapters && snapshot.chapters.length > 0) {
        const newChapters = snapshot.chapters.map(c => ({
          id: crypto.randomUUID(),
          programTemplateId: programId,
          title: c.title,
          objectives: c.objectives,
          order: c.order,
          durationHours: c.durationHours,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        await tx.insert(programTemplateChapters).values(newChapters)
      }

      return { success: true as const }
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'restoreProgramVersionFailed')),
  ).mapErr(tapLogErr(databaseLogger, { versionId }))
}

// ===== PROGRAM STATS =====

export function getProgramStats(): ResultAsync<{
  programs: number
  chapters: number
  schoolYears: number
}, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    Promise.all([
      db.select({ count: count() }).from(programTemplates),
      db.select({ count: count() }).from(programTemplateChapters),
      db.select({ count: count() }).from(schoolYearTemplates),
    ]).then(([programsCount, chaptersCount, schoolYearsCount]) => ({
      programs: programsCount[0]?.count || 0,
      chapters: chaptersCount[0]?.count || 0,
      schoolYears: schoolYearsCount[0]?.count || 0,
    })),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'fetchProgramStatsFailed')),
  ).mapErr(tapLogErr(databaseLogger, {}))
}

// ===== TERM TEMPLATES =====

export function getTermTemplates(schoolYearTemplateId?: string): ResultAsync<typeof termTemplates.$inferSelect[], DatabaseError> {
  const db = getDb()

  const query = db.select().from(termTemplates).orderBy(asc(termTemplates.order))

  if (schoolYearTemplateId) {
    query.where(eq(termTemplates.schoolYearTemplateId, schoolYearTemplateId))
  }

  return ResultAsync.fromPromise(
    query,
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'fetchTermTemplatesFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolYearTemplateId }))
}

export function getTermTemplateById(id: string): ResultAsync<typeof termTemplates.$inferSelect | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(termTemplates)
      .where(eq(termTemplates.id, id))
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'fetchTermTemplateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function createTermTemplate(
  data: Omit<typeof termTemplates.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): ResultAsync<typeof termTemplates.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .insert(termTemplates)
      .values({
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .then(rows => rows[0]!),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'createTermTemplateFailed')),
  ).mapErr(tapLogErr(databaseLogger, data))
}

export function updateTermTemplate(
  id: string,
  data: Partial<Omit<typeof termTemplates.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
): ResultAsync<typeof termTemplates.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .update(termTemplates)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(termTemplates.id, id))
      .returning()
      .then((rows) => {
        if (rows.length === 0) {
          throw new Error(`Term template with id ${id} not found`)
        }
        return rows[0]!
      }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'updateTermTemplateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id, ...data }))
}

export function deleteTermTemplate(id: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.delete(termTemplates).where(eq(termTemplates.id, id)).then(() => {}),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'deleteTermTemplateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function bulkCreateTermTemplates(
  schoolYearTemplateId: string,
  terms: { name: string, type: 'trimester' | 'semester', order: number }[],
): ResultAsync<typeof termTemplates.$inferSelect[], DatabaseError> {
  const db = getDb()
  if (terms.length === 0)
    return ResultAsync.fromPromise(Promise.resolve([]), err => DatabaseError.from(err))

  const values = terms.map(term => ({
    id: crypto.randomUUID(),
    ...term,
    schoolYearTemplateId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  return ResultAsync.fromPromise(
    db
      .insert(termTemplates)
      .values(values)
      .returning(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'bulkCreateTermTemplatesFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolYearTemplateId, terms }))
}

export function getSchoolYearTemplatesWithTerms(): ResultAsync<Array<typeof schoolYearTemplates.$inferSelect & { terms: typeof termTemplates.$inferSelect[] }>, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    Promise.all([
      db.select().from(schoolYearTemplates).orderBy(desc(schoolYearTemplates.isActive), desc(schoolYearTemplates.name)),
      db.select().from(termTemplates).orderBy(asc(termTemplates.order)),
    ]).then(([years, terms]) => years.map(year => ({
      ...year,
      terms: terms.filter(t => t.schoolYearTemplateId === year.id),
    }))),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('programs', 'fetchSchoolYearTemplatesWithTermsFailed')),
  ).mapErr(tapLogErr(databaseLogger, {}))
}
