import { and, asc, count, desc, eq, like } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import {
  grades,
  programTemplateChapters,
  programTemplates,
  programTemplateVersions,
  schoolYearTemplates,
  subjects,
} from '@/drizzle/core-schema'

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

// ===== SCHOOL YEAR TEMPLATES =====

export async function getSchoolYearTemplates() {
  const db = getDb()
  return db
    .select()
    .from(schoolYearTemplates)
    .orderBy(desc(schoolYearTemplates.isActive), desc(schoolYearTemplates.name))
}

export async function getSchoolYearTemplateById(id: string) {
  const db = getDb()
  const [template] = await db
    .select()
    .from(schoolYearTemplates)
    .where(eq(schoolYearTemplates.id, id))
  return template || null
}

export async function createSchoolYearTemplate(
  data: Omit<typeof schoolYearTemplates.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
) {
  const db = getDb()
  const [newTemplate] = await db
    .insert(schoolYearTemplates)
    .values({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()
  return newTemplate!
}

export async function updateSchoolYearTemplate(
  id: string,
  data: Partial<Omit<typeof schoolYearTemplates.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
) {
  const db = getDb()
  const [updated] = await db
    .update(schoolYearTemplates)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schoolYearTemplates.id, id))
    .returning()

  if (!updated) {
    throw new Error(`School year template with id ${id} not found`)
  }

  return updated
}

export async function deleteSchoolYearTemplate(id: string) {
  const db = getDb()
  await db.delete(schoolYearTemplates).where(eq(schoolYearTemplates.id, id))
}

// ===== PROGRAM TEMPLATES =====

export async function getProgramTemplates(options?: {
  schoolYearTemplateId?: string
  subjectId?: string
  gradeId?: string
  search?: string
  status?: 'draft' | 'published' | 'archived'
  page?: number
  limit?: number
}) {
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

  // Get total count
  const [countResult] = await db
    .select({ count: count() })
    .from(programTemplates)
    .where(whereClause)

  const total = countResult?.count || 0

  // Get programs with relations
  const programs = await db
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
    .offset(offset)

  return {
    programs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getProgramTemplateById(id: string) {
  const db = getDb()
  const [program] = await db
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

  return program || null
}

export async function createProgramTemplate(
  data: Omit<typeof programTemplates.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
) {
  const db = getDb()
  const [newProgram] = await db
    .insert(programTemplates)
    .values({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()
  return newProgram!
}

export async function updateProgramTemplate(
  id: string,
  data: Partial<Omit<typeof programTemplates.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
) {
  const db = getDb()
  const [updated] = await db
    .update(programTemplates)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(programTemplates.id, id))
    .returning()

  if (!updated) {
    throw new Error(`Program template with id ${id} not found`)
  }

  return updated
}

export async function deleteProgramTemplate(id: string) {
  const db = getDb()
  // Delete chapters first (cascade)
  await db.delete(programTemplateChapters).where(eq(programTemplateChapters.programTemplateId, id))
  // Then delete program
  await db.delete(programTemplates).where(eq(programTemplates.id, id))
}

export async function cloneProgramTemplate(id: string, newSchoolYearTemplateId: string, newName: string) {
  const db = getDb()

  // Get original program
  const [original] = await db
    .select()
    .from(programTemplates)
    .where(eq(programTemplates.id, id))

  if (!original) {
    throw new Error(`Program template with id ${id} not found`)
  }

  // Get original chapters
  const originalChapters = await db
    .select()
    .from(programTemplateChapters)
    .where(eq(programTemplateChapters.programTemplateId, id))
    .orderBy(asc(programTemplateChapters.order))

  // Create new program
  const newProgramId = crypto.randomUUID()
  const [newProgram] = await db
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

    await db.insert(programTemplateChapters).values(newChapters)
  }

  return newProgram!
}

// ===== PROGRAM TEMPLATE CHAPTERS =====

export async function getProgramTemplateChapters(programTemplateId: string) {
  const db = getDb()
  return db
    .select()
    .from(programTemplateChapters)
    .where(eq(programTemplateChapters.programTemplateId, programTemplateId))
    .orderBy(asc(programTemplateChapters.order))
}

export async function getProgramTemplateChapterById(id: string) {
  const db = getDb()
  const [chapter] = await db
    .select()
    .from(programTemplateChapters)
    .where(eq(programTemplateChapters.id, id))
  return chapter || null
}

export async function createProgramTemplateChapter(
  data: Omit<typeof programTemplateChapters.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
) {
  const db = getDb()
  const [newChapter] = await db
    .insert(programTemplateChapters)
    .values({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()
  return newChapter!
}

export async function updateProgramTemplateChapter(
  id: string,
  data: Partial<Omit<typeof programTemplateChapters.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
) {
  const db = getDb()
  const [updated] = await db
    .update(programTemplateChapters)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(programTemplateChapters.id, id))
    .returning()

  if (!updated) {
    throw new Error(`Program template chapter with id ${id} not found`)
  }

  return updated
}

export async function deleteProgramTemplateChapter(id: string) {
  const db = getDb()
  await db.delete(programTemplateChapters).where(eq(programTemplateChapters.id, id))
}

export async function bulkUpdateChaptersOrder(items: { id: string, order: number }[]) {
  const db = getDb()
  if (items.length === 0)
    return

  await db.transaction(async (tx) => {
    for (const item of items) {
      await tx
        .update(programTemplateChapters)
        .set({
          order: item.order,
          updatedAt: new Date(),
        })
        .where(eq(programTemplateChapters.id, item.id))
    }
  })
}

export async function bulkCreateChapters(
  programTemplateId: string,
  chapters: {
    title: string
    objectives?: string | null
    order?: number
    durationHours?: number | null
  }[],
) {
  const db = getDb()
  if (chapters.length === 0)
    return []

  const values = chapters.map((chapter, index) => ({
    id: crypto.randomUUID(),
    ...chapter,
    order: chapter.order || index + 1,
    programTemplateId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  const newChapters = await db
    .insert(programTemplateChapters)
    .values(values)
    .returning()

  return newChapters
}

// ===== PROGRAM VERSIONS =====

export async function publishProgram(id: string) {
  const db = getDb()

  // 1. Get current program and chapters
  const program = await getProgramTemplateById(id)
  if (!program) {
    throw new Error(`Program template with id ${id} not found`)
  }

  const chapters = await getProgramTemplateChapters(id)

  // 2. Create snapshot
  const snapshot = {
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
  const [lastVersion] = await db
    .select()
    .from(programTemplateVersions)
    .where(eq(programTemplateVersions.programTemplateId, id))
    .orderBy(desc(programTemplateVersions.versionNumber))
    .limit(1)

  const nextVersion = (lastVersion?.versionNumber || 0) + 1

  // 4. Transaction: Update status + Create version
  await db.transaction(async (tx) => {
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
  })

  return { success: true, version: nextVersion }
}

export async function getProgramVersions(programTemplateId: string) {
  const db = getDb()
  return db
    .select()
    .from(programTemplateVersions)
    .where(eq(programTemplateVersions.programTemplateId, programTemplateId))
    .orderBy(desc(programTemplateVersions.versionNumber))
}

export async function restoreProgramVersion(versionId: string) {
  const db = getDb()

  // 1. Get version snapshot
  const [version] = await db
    .select()
    .from(programTemplateVersions)
    .where(eq(programTemplateVersions.id, versionId))

  if (!version) {
    throw new Error(`Version with id ${versionId} not found`)
  }

  const snapshot = version.snapshotData as unknown as ProgramSnapshot
  const programId = version.programTemplateId

  // 2. Transaction: Restore program + Replace chapters
  await db.transaction(async (tx) => {
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
      const newChapters = snapshot.chapters.map((c: any) => ({
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
  })

  return { success: true }
}

// ===== PROGRAM STATS =====

export async function getProgramStats() {
  const db = getDb()

  const [programsCount] = await db.select({ count: count() }).from(programTemplates)
  const [chaptersCount] = await db.select({ count: count() }).from(programTemplateChapters)
  const [schoolYearsCount] = await db.select({ count: count() }).from(schoolYearTemplates)

  return {
    programs: programsCount?.count || 0,
    chapters: chaptersCount?.count || 0,
    schoolYears: schoolYearsCount?.count || 0,
  }
}
