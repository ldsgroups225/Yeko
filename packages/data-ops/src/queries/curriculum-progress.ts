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
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm'
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

export async function getClassSessions(params: {
  classId: string
  subjectId?: string
  startDate?: string
  endDate?: string
  status?: ClassSessionStatus
}): R.ResultAsync<ClassSessionWithDetails[], DatabaseError> {
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

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        return await db.query.classSessions.findMany({
          where: and(...conditions),
          with: {
            subject: { columns: { id: true, name: true, shortName: true } },
            teacher: {
              with: { user: { columns: { name: true } } },
            },
            chapter: { columns: { id: true, title: true, order: true } },
          },
          orderBy: [desc(classSessions.date), asc(classSessions.startTime)],
        }) as ClassSessionWithDetails[]
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchSessionsFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

export async function getClassSessionById(id: string): R.ResultAsync<ClassSessionFull | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        return await db.query.classSessions.findFirst({
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
        }) as ClassSessionFull | undefined
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchSessionByIdFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id })),
  )
}

export async function createClassSession(data: ClassSessionInsert): R.ResultAsync<typeof classSessions.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db.insert(classSessions).values(data).returning()
        if (rows.length === 0) {
          throw new DatabaseError('INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'createSessionFailed'))
        }
        return rows[0]!
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'createSessionFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, data)),
  )
}

export async function updateClassSession(
  id: string,
  data: Partial<Omit<ClassSessionInsert, 'id' | 'classId'>>,
): R.ResultAsync<typeof classSessions.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db
          .update(classSessions)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(classSessions.id, id))
          .returning()
        if (rows.length === 0) {
          throw new DatabaseError('INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'updateSessionFailed'))
        }
        return rows[0]!
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'updateSessionFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id, ...data })),
  )
}

export async function markSessionCompleted(
  id: string,
  data: {
    chapterId?: string
    studentsPresent?: number
    studentsAbsent?: number
    notes?: string
  },
): R.ResultAsync<typeof classSessions.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db
          .update(classSessions)
          .set({
            status: 'completed',
            completedAt: new Date(),
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(classSessions.id, id))
          .returning()
        if (rows.length === 0) {
          throw new DatabaseError('INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'markSessionCompletedFailed'))
        }
        return rows[0]!
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'markSessionCompletedFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id, ...data })),
  )
}

export async function deleteClassSession(id: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        await db.delete(classSessions).where(eq(classSessions.id, id))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'deleteSessionFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id })),
  )
}

// ============================================
// CHAPTER COMPLETIONS
// ============================================

export async function getChapterCompletions(params: {
  classId: string
  subjectId?: string
}): R.ResultAsync<ChapterCompletionWithDetails[], DatabaseError> {
  const db = getDb()
  const conditions = [eq(chapterCompletions.classId, params.classId)]

  if (params.subjectId) {
    conditions.push(eq(chapterCompletions.subjectId, params.subjectId))
  }

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        return await db.query.chapterCompletions.findMany({
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
        }) as ChapterCompletionWithDetails[]
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchChapterCompletionsFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

export async function markChapterComplete(data: ChapterCompletionInsert): R.ResultAsync<typeof chapterCompletions.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db.insert(chapterCompletions).values(data).returning()
        if (rows.length === 0) {
          throw new DatabaseError('INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'markChapterCompleteFailed'))
        }
        return rows[0]!
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'markChapterCompleteFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, data)),
  )
}

export async function unmarkChapterComplete(classId: string, chapterId: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        await db
          .delete(chapterCompletions)
          .where(
            and(
              eq(chapterCompletions.classId, classId),
              eq(chapterCompletions.chapterId, chapterId),
            ),
          )
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'unmarkChapterCompleteFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { classId, chapterId })),
  )
}

export async function isChapterCompleted(classId: string, chapterId: string): R.ResultAsync<boolean, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const completion = await db.query.chapterCompletions.findFirst({
          where: and(
            eq(chapterCompletions.classId, classId),
            eq(chapterCompletions.chapterId, chapterId),
          ),
        })
        return !!completion
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'checkChapterCompletedFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { classId, chapterId })),
  )
}

// ============================================
// CURRICULUM PROGRESS
// ============================================

export async function getCurriculumProgress(params: {
  classId: string
  termId: string
  subjectId?: string
}): R.ResultAsync<CurriculumProgressWithDetails[], DatabaseError> {
  const db = getDb()
  const conditions = [
    eq(curriculumProgress.classId, params.classId),
    eq(curriculumProgress.termId, params.termId),
  ]

  if (params.subjectId) {
    conditions.push(eq(curriculumProgress.subjectId, params.subjectId))
  }

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        return await db.query.curriculumProgress.findMany({
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
        }) as CurriculumProgressWithDetails[]
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchProgressFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

export async function getProgressOverview(params: {
  schoolId: string
  schoolYearId: string
  termId?: string
}): R.ResultAsync<ProgressOverviewItem[], DatabaseError> {
  const db = getDb()

  const conditions = [eq(classes.schoolId, params.schoolId)]
  if (params.termId) {
    conditions.push(eq(curriculumProgress.termId, params.termId))
  }

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        return await db
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
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchOverviewFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

export async function getClassesBehindSchedule(params: {
  schoolId: string
  termId: string
  threshold?: number // Default -10 (10% behind)
}): R.ResultAsync<ClassBehindSchedule[], DatabaseError> {
  const db = getDb()
  const threshold = params.threshold ?? -10

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        return await db
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
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchBehindScheduleFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

export async function upsertCurriculumProgress(data: CurriculumProgressInsert): R.ResultAsync<typeof curriculumProgress.$inferSelect, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
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
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'upsertProgressFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, data)),
  )
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
}): R.ResultAsync<{
  totalChapters: number
  completedChapters: number
  progressPercentage: number
  expectedPercentage: number
  variance: number
  status: ProgressStatus
}, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
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
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'calculateProgressFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

// ============================================
// STATISTICS
// ============================================

export async function getProgressStatsByStatus(schoolId: string, termId: string): R.ResultAsync<ProgressStatsByStatus[], DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        return await db
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
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchStatsByStatusFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, termId })),
  )
}

export async function getProgressBySubject(schoolId: string, termId: string): R.ResultAsync<ProgressBySubject[], DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        return await db
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
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchProgressBySubjectFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, termId })),
  )
}

export async function getTeacherProgressSummary(teacherId: string, termId: string): R.ResultAsync<TeacherProgressSummaryItem[], DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        // Get classes taught by this teacher
        const sessions = await db.query.classSessions.findMany({
          where: and(
            eq(classSessions.teacherId, teacherId),
            eq(classSessions.status, 'completed'),
          ),
          columns: { classId: true, subjectId: true },
        })

        // Get unique class-subject combinations
        const classSubjectsMap = new Map<string, { classId: string, subjectId: string }>()
        for (const session of sessions) {
          const key = `${session.classId}-${session.subjectId}`
          if (!classSubjectsMap.has(key)) {
            classSubjectsMap.set(key, { classId: session.classId, subjectId: session.subjectId })
          }
        }

        // Get progress for each class-subject
        const progressRecords = []
        for (const { classId, subjectId } of classSubjectsMap.values()) {
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

        return progressRecords as TeacherProgressSummaryItem[]
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('curriculum', 'fetchTeacherSummaryFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { teacherId, termId })),
  )
}
