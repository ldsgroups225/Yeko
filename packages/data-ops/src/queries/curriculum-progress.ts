import type {
  ChapterCompletionInsert,
  ClassSessionInsert,
  ClassSessionStatus,
  CurriculumProgressInsert,
  ProgressStatus,
} from '../drizzle/school-schema'
import { and, asc, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { grades, programTemplateChapters, programTemplates, subjects } from '../drizzle/core-schema'
import {
  chapterCompletions,
  classes,
  classSessions,
  curriculumProgress,
  teachers,
  terms,
  users,
} from '../drizzle/school-schema'

// ============================================
// CLASS SESSIONS
// ============================================

export async function getClassSessions(params: {
  classId: string
  subjectId?: string
  startDate?: string
  endDate?: string
  status?: ClassSessionStatus
}) {
  const db = getDb()
  const conditions = [eq(classSessions.classId, params.classId)]

  if (params.subjectId) {
    conditions.push(eq(classSessions.subjectId, params.subjectId))
  }
  if (params.startDate) {
    conditions.push(gte(classSessions.date, params.startDate))
  }
  if (params.endDate) {
    conditions.push(lte(classSessions.date, params.endDate))
  }
  if (params.status) {
    conditions.push(eq(classSessions.status, params.status))
  }

  return db.query.classSessions.findMany({
    where: and(...conditions),
    with: {
      subject: { columns: { id: true, name: true, shortName: true } },
      teacher: {
        with: { user: { columns: { name: true } } },
      },
      chapter: { columns: { id: true, title: true, order: true } },
    },
    orderBy: [desc(classSessions.date), asc(classSessions.startTime)],
  })
}

export async function getClassSessionById(id: string) {
  const db = getDb()
  return db.query.classSessions.findFirst({
    where: eq(classSessions.id, id),
    with: {
      class: {
        with: { grade: true, series: true },
      },
      subject: true,
      teacher: {
        with: { user: { columns: { name: true } } },
      },
      chapter: true,
      timetableSession: true,
    },
  })
}

export async function createClassSession(data: ClassSessionInsert) {
  const db = getDb()
  const [session] = await db.insert(classSessions).values(data).returning()
  return session
}

export async function updateClassSession(
  id: string,
  data: Partial<Omit<ClassSessionInsert, 'id' | 'classId'>>,
) {
  const db = getDb()
  const [updated] = await db
    .update(classSessions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(classSessions.id, id))
    .returning()
  return updated
}

export async function markSessionCompleted(
  id: string,
  data: {
    chapterId?: string
    studentsPresent?: number
    studentsAbsent?: number
    notes?: string
  },
) {
  const db = getDb()
  const [updated] = await db
    .update(classSessions)
    .set({
      status: 'completed',
      completedAt: new Date(),
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(classSessions.id, id))
    .returning()
  return updated
}

export async function deleteClassSession(id: string) {
  const db = getDb()
  await db.delete(classSessions).where(eq(classSessions.id, id))
}

// ============================================
// CHAPTER COMPLETIONS
// ============================================

export async function getChapterCompletions(params: {
  classId: string
  subjectId?: string
}) {
  const db = getDb()
  const conditions = [eq(chapterCompletions.classId, params.classId)]

  if (params.subjectId) {
    conditions.push(eq(chapterCompletions.subjectId, params.subjectId))
  }

  return db.query.chapterCompletions.findMany({
    where: and(...conditions),
    with: {
      chapter: {
        columns: { id: true, title: true, order: true, durationHours: true },
      },
      teacher: {
        with: { user: { columns: { name: true } } },
      },
      classSession: {
        columns: { id: true, date: true, topic: true },
      },
    },
    orderBy: [desc(chapterCompletions.completedAt)],
  })
}

export async function markChapterComplete(data: ChapterCompletionInsert) {
  const db = getDb()
  const [completion] = await db.insert(chapterCompletions).values(data).returning()
  return completion
}

export async function unmarkChapterComplete(classId: string, chapterId: string) {
  const db = getDb()
  await db
    .delete(chapterCompletions)
    .where(
      and(
        eq(chapterCompletions.classId, classId),
        eq(chapterCompletions.chapterId, chapterId),
      ),
    )
}

export async function isChapterCompleted(classId: string, chapterId: string) {
  const db = getDb()
  const completion = await db.query.chapterCompletions.findFirst({
    where: and(
      eq(chapterCompletions.classId, classId),
      eq(chapterCompletions.chapterId, chapterId),
    ),
  })
  return !!completion
}

// ============================================
// CURRICULUM PROGRESS
// ============================================

export async function getCurriculumProgress(params: {
  classId: string
  termId: string
  subjectId?: string
}) {
  const db = getDb()
  const conditions = [
    eq(curriculumProgress.classId, params.classId),
    eq(curriculumProgress.termId, params.termId),
  ]

  if (params.subjectId) {
    conditions.push(eq(curriculumProgress.subjectId, params.subjectId))
  }

  return db.query.curriculumProgress.findMany({
    where: and(...conditions),
    with: {
      subject: { columns: { id: true, name: true, shortName: true, category: true } },
      programTemplate: {
        columns: { id: true, name: true },
        with: {
          chapters: {
            columns: { id: true, title: true, order: true },
            orderBy: [asc(programTemplateChapters.order)],
          },
        },
      },
    },
    orderBy: [asc(subjects.name)],
  })
}

export async function getProgressOverview(params: {
  schoolId: string
  schoolYearId: string
  termId?: string
}) {
  const db = getDb()

  const conditions = [eq(classes.schoolId, params.schoolId)]
  if (params.termId) {
    conditions.push(eq(curriculumProgress.termId, params.termId))
  }

  return db
    .select({
      classId: curriculumProgress.classId,
      className: classes.section,
      gradeName: grades.name,
      subjectId: curriculumProgress.subjectId,
      subjectName: subjects.name,
      totalChapters: curriculumProgress.totalChapters,
      completedChapters: curriculumProgress.completedChapters,
      progressPercentage: curriculumProgress.progressPercentage,
      expectedPercentage: curriculumProgress.expectedPercentage,
      variance: curriculumProgress.variance,
      status: curriculumProgress.status,
      lastChapterCompletedAt: curriculumProgress.lastChapterCompletedAt,
    })
    .from(curriculumProgress)
    .innerJoin(classes, eq(curriculumProgress.classId, classes.id))
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .innerJoin(subjects, eq(curriculumProgress.subjectId, subjects.id))
    .where(and(...conditions))
    .orderBy(asc(grades.order), asc(classes.section), asc(subjects.name))
}

export async function getClassesBehindSchedule(params: {
  schoolId: string
  termId: string
  threshold?: number // Default -10 (10% behind)
}) {
  const db = getDb()
  const threshold = params.threshold ?? -10

  return db
    .select({
      classId: curriculumProgress.classId,
      className: classes.section,
      gradeName: grades.name,
      subjectId: curriculumProgress.subjectId,
      subjectName: subjects.name,
      progressPercentage: curriculumProgress.progressPercentage,
      expectedPercentage: curriculumProgress.expectedPercentage,
      variance: curriculumProgress.variance,
      status: curriculumProgress.status,
    })
    .from(curriculumProgress)
    .innerJoin(classes, eq(curriculumProgress.classId, classes.id))
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .innerJoin(subjects, eq(curriculumProgress.subjectId, subjects.id))
    .where(
      and(
        eq(classes.schoolId, params.schoolId),
        eq(curriculumProgress.termId, params.termId),
        lte(curriculumProgress.variance, String(threshold)),
      ),
    )
    .orderBy(asc(curriculumProgress.variance))
}

export async function upsertCurriculumProgress(data: CurriculumProgressInsert) {
  const db = getDb()

  // Check if progress record exists
  const existing = await db.query.curriculumProgress.findFirst({
    where: and(
      eq(curriculumProgress.classId, data.classId),
      eq(curriculumProgress.subjectId, data.subjectId),
      eq(curriculumProgress.termId, data.termId),
    ),
  })

  if (existing) {
    const [updated] = await db
      .update(curriculumProgress)
      .set({
        totalChapters: data.totalChapters,
        completedChapters: data.completedChapters,
        progressPercentage: data.progressPercentage,
        expectedPercentage: data.expectedPercentage,
        variance: data.variance,
        status: data.status,
        lastChapterCompletedAt: data.lastChapterCompletedAt,
        calculatedAt: new Date(),
      })
      .where(eq(curriculumProgress.id, existing.id))
      .returning()
    return updated
  }

  const [created] = await db.insert(curriculumProgress).values(data).returning()
  return created
}

// ============================================
// PROGRESS CALCULATION
// ============================================

export async function calculateProgress(params: {
  classId: string
  subjectId: string
  termId: string
  programTemplateId: string
  termStartDate: Date
  termEndDate: Date
}): Promise<{
  totalChapters: number
  completedChapters: number
  progressPercentage: number
  expectedPercentage: number
  variance: number
  status: ProgressStatus
}> {
  const db = getDb()

  // Get total chapters from program template
  const chapters = await db.query.programTemplateChapters.findMany({
    where: eq(programTemplateChapters.programTemplateId, params.programTemplateId),
  })
  const totalChapters = chapters.length

  if (totalChapters === 0) {
    return {
      totalChapters: 0,
      completedChapters: 0,
      progressPercentage: 0,
      expectedPercentage: 0,
      variance: 0,
      status: 'on_track',
    }
  }

  // Get completed chapters
  const completions = await db.query.chapterCompletions.findMany({
    where: and(
      eq(chapterCompletions.classId, params.classId),
      eq(chapterCompletions.subjectId, params.subjectId),
    ),
  })
  const completedChapters = completions.length

  // Calculate actual progress
  const progressPercentage = (completedChapters / totalChapters) * 100

  // Calculate expected progress based on term dates
  const now = new Date()
  const termDuration = params.termEndDate.getTime() - params.termStartDate.getTime()
  const elapsed = Math.min(
    Math.max(now.getTime() - params.termStartDate.getTime(), 0),
    termDuration,
  )
  const expectedPercentage = (elapsed / termDuration) * 100

  // Calculate variance
  const variance = progressPercentage - expectedPercentage

  // Determine status
  let status: ProgressStatus
  if (variance >= 5) {
    status = 'ahead'
  } else if (variance >= -5) {
    status = 'on_track'
  } else if (variance >= -15) {
    status = 'slightly_behind'
  } else {
    status = 'significantly_behind'
  }

  return {
    totalChapters,
    completedChapters,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    expectedPercentage: Math.round(expectedPercentage * 100) / 100,
    variance: Math.round(variance * 100) / 100,
    status,
  }
}

// ============================================
// STATISTICS
// ============================================

export async function getProgressStatsByStatus(schoolId: string, termId: string) {
  const db = getDb()

  return db
    .select({
      status: curriculumProgress.status,
      count: sql<number>`count(*)`,
    })
    .from(curriculumProgress)
    .innerJoin(classes, eq(curriculumProgress.classId, classes.id))
    .where(
      and(
        eq(classes.schoolId, schoolId),
        eq(curriculumProgress.termId, termId),
      ),
    )
    .groupBy(curriculumProgress.status)
}

export async function getProgressBySubject(schoolId: string, termId: string) {
  const db = getDb()

  return db
    .select({
      subjectId: curriculumProgress.subjectId,
      subjectName: subjects.name,
      avgProgress: sql<number>`round(avg(${curriculumProgress.progressPercentage}), 2)`,
      avgExpected: sql<number>`round(avg(${curriculumProgress.expectedPercentage}), 2)`,
      avgVariance: sql<number>`round(avg(${curriculumProgress.variance}), 2)`,
      classCount: sql<number>`count(distinct ${curriculumProgress.classId})`,
    })
    .from(curriculumProgress)
    .innerJoin(classes, eq(curriculumProgress.classId, classes.id))
    .innerJoin(subjects, eq(curriculumProgress.subjectId, subjects.id))
    .where(
      and(
        eq(classes.schoolId, schoolId),
        eq(curriculumProgress.termId, termId),
      ),
    )
    .groupBy(curriculumProgress.subjectId, subjects.name)
    .orderBy(asc(subjects.name))
}

export async function getTeacherProgressSummary(teacherId: string, termId: string) {
  const db = getDb()

  // Get classes taught by this teacher
  const sessions = await db.query.classSessions.findMany({
    where: and(
      eq(classSessions.teacherId, teacherId),
      eq(classSessions.status, 'completed'),
    ),
    columns: { classId: true, subjectId: true },
  })

  // Get unique class-subject combinations
  const classSubjects = new Map<string, { classId: string, subjectId: string }>()
  for (const session of sessions) {
    const key = `${session.classId}-${session.subjectId}`
    if (!classSubjects.has(key)) {
      classSubjects.set(key, { classId: session.classId, subjectId: session.subjectId })
    }
  }

  // Get progress for each class-subject
  const progressRecords = []
  for (const { classId, subjectId } of classSubjects.values()) {
    const progress = await db.query.curriculumProgress.findFirst({
      where: and(
        eq(curriculumProgress.classId, classId),
        eq(curriculumProgress.subjectId, subjectId),
        eq(curriculumProgress.termId, termId),
      ),
      with: {
        class: {
          with: { grade: { columns: { name: true } } },
          columns: { section: true },
        },
        subject: { columns: { name: true } },
      },
    })
    if (progress) {
      progressRecords.push(progress)
    }
  }

  return progressRecords
}
