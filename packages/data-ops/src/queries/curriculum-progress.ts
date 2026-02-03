import type { programTemplates, series } from '../drizzle/core-schema'
import type {
  ChapterCompletionInsert,
  ClassSessionInsert,
  ClassSessionStatus,
  CurriculumProgressInsert,
  ProgressStatus,

  timetableSessions,
  users,
} from '../drizzle/school-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { grades, programTemplateChapters, subjects } from '../drizzle/core-schema'
import {
  chapterCompletions,
  classes,
  classSessions,
  curriculumProgress,
} from '../drizzle/school-schema'
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

// ============================================
// TYPE DEFINITIONS
// ============================================

type ClassSessionWithDetails = typeof classSessions.$inferSelect & {
  subject: Pick<typeof subjects.$inferSelect, 'id' | 'name' | 'shortName'> | null
  teacher: {
    user: Pick<typeof users.$inferSelect, 'name'> | null
  } | null
  chapter: Pick<typeof programTemplateChapters.$inferSelect, 'id' | 'title' | 'order'> | null
}

type ClassSessionFull = typeof classSessions.$inferSelect & {
  class: (typeof classes.$inferSelect & {
    grade: typeof grades.$inferSelect | null
    series: typeof series.$inferSelect | null
  }) | null
  subject: typeof subjects.$inferSelect | null
  teacher: {
    user: Pick<typeof users.$inferSelect, 'name'> | null
  } | null
  chapter: typeof programTemplateChapters.$inferSelect | null
  timetableSession: typeof timetableSessions.$inferSelect | null
}

type ChapterCompletionWithDetails = typeof chapterCompletions.$inferSelect & {
  chapter: Pick<typeof programTemplateChapters.$inferSelect, 'id' | 'title' | 'order' | 'durationHours'> | null
  teacher: {
    user: Pick<typeof users.$inferSelect, 'name'> | null
  } | null
  classSession: Pick<typeof classSessions.$inferSelect, 'id' | 'date' | 'topic'> | null
}

type CurriculumProgressWithDetails = typeof curriculumProgress.$inferSelect & {
  subject: Pick<typeof subjects.$inferSelect, 'id' | 'name' | 'shortName' | 'category'> | null
  programTemplate: (Pick<typeof programTemplates.$inferSelect, 'id' | 'name'> & {
    chapters: Pick<typeof programTemplateChapters.$inferSelect, 'id' | 'title' | 'order'>[]
  }) | null
}

interface ProgressOverviewItem {
  classId: string
  className: string
  gradeName: string
  subjectId: string
  subjectName: string
  totalChapters: typeof curriculumProgress.$inferSelect['totalChapters']
  completedChapters: typeof curriculumProgress.$inferSelect['completedChapters']
  progressPercentage: typeof curriculumProgress.$inferSelect['progressPercentage']
  expectedPercentage: typeof curriculumProgress.$inferSelect['expectedPercentage']
  variance: typeof curriculumProgress.$inferSelect['variance']
  status: ProgressStatus
  lastChapterCompletedAt: Date | null
}

interface ClassBehindSchedule {
  classId: string
  className: string
  gradeName: string
  subjectId: string
  subjectName: string
  progressPercentage: typeof curriculumProgress.$inferSelect['progressPercentage']
  expectedPercentage: typeof curriculumProgress.$inferSelect['expectedPercentage']
  variance: typeof curriculumProgress.$inferSelect['variance']
  status: ProgressStatus
}

interface ProgressStatsByStatus {
  status: ProgressStatus
  count: number
}

interface ProgressBySubject {
  subjectId: string
  subjectName: string
  avgProgress: number
  avgExpected: number
  avgVariance: number
  classCount: number
}

type TeacherProgressSummaryItem = typeof curriculumProgress.$inferSelect & {
  class: (Pick<typeof classes.$inferSelect, 'section'> & {
    grade: Pick<typeof grades.$inferSelect, 'name'> | null
  }) | null
  subject: Pick<typeof subjects.$inferSelect, 'name'> | null
}

// ============================================
// CLASS SESSIONS
// ============================================

export function getClassSessions(params: {
  classId: string
  subjectId?: string
  startDate?: string
  endDate?: string
  status?: ClassSessionStatus
}): ResultAsync<ClassSessionWithDetails[], DatabaseError> {
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

  return ResultAsync.fromPromise(
    db.query.classSessions.findMany({
      where: and(...conditions),
      with: {
        subject: { columns: { id: true, name: true, shortName: true } },
        teacher: {
          with: { user: { columns: { name: true } } },
        },
        chapter: { columns: { id: true, title: true, order: true } },
      },
      orderBy: [desc(classSessions.date), asc(classSessions.startTime)],
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchSessionsFailed')),
  ).mapErr(tapLogErr(databaseLogger, params))
}

export function getClassSessionById(id: string): ResultAsync<ClassSessionFull | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.query.classSessions.findFirst({
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
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchSessionByIdFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function createClassSession(data: ClassSessionInsert): ResultAsync<typeof classSessions.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.insert(classSessions).values(data).returning().then(rows => rows[0]!),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'createSessionFailed')),
  ).mapErr(tapLogErr(databaseLogger, data))
}

export function updateClassSession(
  id: string,
  data: Partial<Omit<ClassSessionInsert, 'id' | 'classId'>>,
): ResultAsync<typeof classSessions.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .update(classSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(classSessions.id, id))
      .returning()
      .then(rows => rows[0]!),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'updateSessionFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id, ...data }))
}

export function markSessionCompleted(
  id: string,
  data: {
    chapterId?: string
    studentsPresent?: number
    studentsAbsent?: number
    notes?: string
  },
): ResultAsync<typeof classSessions.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .update(classSessions)
      .set({
        status: 'completed',
        completedAt: new Date(),
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(classSessions.id, id))
      .returning()
      .then(rows => rows[0]!),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'markSessionCompletedFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id, ...data }))
}

export function deleteClassSession(id: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.delete(classSessions).where(eq(classSessions.id, id)).then(() => {}),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'deleteSessionFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

// ============================================
// CHAPTER COMPLETIONS
// ============================================

export function getChapterCompletions(params: {
  classId: string
  subjectId?: string
}): ResultAsync<ChapterCompletionWithDetails[], DatabaseError> {
  const db = getDb()
  const conditions = [eq(chapterCompletions.classId, params.classId)]

  if (params.subjectId) {
    conditions.push(eq(chapterCompletions.subjectId, params.subjectId))
  }

  return ResultAsync.fromPromise(
    db.query.chapterCompletions.findMany({
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
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchChapterCompletionsFailed')),
  ).mapErr(tapLogErr(databaseLogger, params))
}

export function markChapterComplete(data: ChapterCompletionInsert): ResultAsync<typeof chapterCompletions.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.insert(chapterCompletions).values(data).returning().then(rows => rows[0]!),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'markChapterCompleteFailed')),
  ).mapErr(tapLogErr(databaseLogger, data))
}

export function unmarkChapterComplete(classId: string, chapterId: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .delete(chapterCompletions)
      .where(
        and(
          eq(chapterCompletions.classId, classId),
          eq(chapterCompletions.chapterId, chapterId),
        ),
      ).then(() => {}),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'unmarkChapterCompleteFailed')),
  ).mapErr(tapLogErr(databaseLogger, { classId, chapterId }))
}

export function isChapterCompleted(classId: string, chapterId: string): ResultAsync<boolean, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.query.chapterCompletions.findFirst({
      where: and(
        eq(chapterCompletions.classId, classId),
        eq(chapterCompletions.chapterId, chapterId),
      ),
    }).then(completion => !!completion),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'checkChapterCompletedFailed')),
  ).mapErr(tapLogErr(databaseLogger, { classId, chapterId }))
}

// ============================================
// CURRICULUM PROGRESS
// ============================================

export function getCurriculumProgress(params: {
  classId: string
  termId: string
  subjectId?: string
}): ResultAsync<CurriculumProgressWithDetails[], DatabaseError> {
  const db = getDb()
  const conditions = [
    eq(curriculumProgress.classId, params.classId),
    eq(curriculumProgress.termId, params.termId),
  ]

  if (params.subjectId) {
    conditions.push(eq(curriculumProgress.subjectId, params.subjectId))
  }

  return ResultAsync.fromPromise(
    db.query.curriculumProgress.findMany({
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
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchProgressFailed')),
  ).mapErr(tapLogErr(databaseLogger, params))
}

export function getProgressOverview(params: {
  schoolId: string
  schoolYearId: string
  termId?: string
}): ResultAsync<ProgressOverviewItem[], DatabaseError> {
  const db = getDb()

  const conditions = [eq(classes.schoolId, params.schoolId)]
  if (params.termId) {
    conditions.push(eq(curriculumProgress.termId, params.termId))
  }

  return ResultAsync.fromPromise(
    db
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
      .orderBy(asc(grades.order), asc(classes.section), asc(subjects.name)),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchOverviewFailed')),
  ).mapErr(tapLogErr(databaseLogger, params))
}

export function getClassesBehindSchedule(params: {
  schoolId: string
  termId: string
  threshold?: number // Default -10 (10% behind)
}): ResultAsync<ClassBehindSchedule[], DatabaseError> {
  const db = getDb()
  const threshold = params.threshold ?? -10

  return ResultAsync.fromPromise(
    db
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
      .orderBy(asc(curriculumProgress.variance)),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchBehindScheduleFailed')),
  ).mapErr(tapLogErr(databaseLogger, params))
}

export function upsertCurriculumProgress(data: CurriculumProgressInsert): ResultAsync<typeof curriculumProgress.$inferSelect, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    (async () => {
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
        if (!updated)
          throw new DatabaseError('INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'updateProgressFailed'))
        return updated
      }

      const [created] = await db.insert(curriculumProgress).values(data).returning()
      if (!created)
        throw new DatabaseError('INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'createProgressFailed'))
      return created
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'upsertProgressFailed')),
  ).mapErr(tapLogErr(databaseLogger, data))
}

// ============================================
// PROGRESS CALCULATION
// ============================================

export function calculateProgress(params: {
  classId: string
  subjectId: string
  termId: string
  programTemplateId: string
  termStartDate: Date
  termEndDate: Date
}): ResultAsync<{
  totalChapters: number
  completedChapters: number
  progressPercentage: number
  expectedPercentage: number
  variance: number
  status: ProgressStatus
}, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    (async () => {
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
          status: 'on_track' as ProgressStatus,
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
      }
      else if (variance >= -5) {
        status = 'on_track'
      }
      else if (variance >= -15) {
        status = 'slightly_behind'
      }
      else {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'calculateProgressFailed')),
  ).mapErr(tapLogErr(databaseLogger, params))
}

// ============================================
// STATISTICS
// ============================================

export function getProgressStatsByStatus(schoolId: string, termId: string): ResultAsync<ProgressStatsByStatus[], DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db
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
      .groupBy(curriculumProgress.status),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchStatsByStatusFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, termId }))
}

export function getProgressBySubject(schoolId: string, termId: string): ResultAsync<ProgressBySubject[], DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db
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
      .orderBy(asc(subjects.name)),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchProgressBySubjectFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, termId }))
}

export function getTeacherProgressSummary(teacherId: string, termId: string): ResultAsync<TeacherProgressSummaryItem[], DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchTeacherSummaryFailed')),
  ).mapErr(tapLogErr(databaseLogger, { teacherId, termId }))
}
