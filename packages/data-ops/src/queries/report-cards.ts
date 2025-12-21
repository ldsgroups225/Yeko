import type {
  ReportCardInsert,
  ReportCardStatus,
  ReportCardTemplateInsert,
  TeacherCommentInsert,
} from '../drizzle/school-schema'
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import {
  reportCards,
  reportCardTemplates,
  studentAverages,
  students,
  teacherComments,
} from '../drizzle/school-schema'

// ============================================
// REPORT CARD TEMPLATES
// ============================================

export async function getReportCardTemplates(schoolId: string) {
  const db = getDb()
  return db.query.reportCardTemplates.findMany({
    where: eq(reportCardTemplates.schoolId, schoolId),
    orderBy: [desc(reportCardTemplates.isDefault), asc(reportCardTemplates.name)],
  })
}

export async function getReportCardTemplateById(id: string) {
  const db = getDb()
  return db.query.reportCardTemplates.findFirst({
    where: eq(reportCardTemplates.id, id),
  })
}

export async function getDefaultTemplate(schoolId: string) {
  const db = getDb()
  return db.query.reportCardTemplates.findFirst({
    where: and(
      eq(reportCardTemplates.schoolId, schoolId),
      eq(reportCardTemplates.isDefault, true),
    ),
  })
}

export async function createReportCardTemplate(data: ReportCardTemplateInsert) {
  const db = getDb()
  const [template] = await db.insert(reportCardTemplates).values(data).returning()
  return template
}

export async function updateReportCardTemplate(
  id: string,
  data: Partial<Omit<ReportCardTemplateInsert, 'id' | 'schoolId'>>,
) {
  const db = getDb()
  const [updated] = await db
    .update(reportCardTemplates)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(reportCardTemplates.id, id))
    .returning()
  return updated
}

export async function deleteReportCardTemplate(id: string) {
  const db = getDb()
  await db.delete(reportCardTemplates).where(eq(reportCardTemplates.id, id))
}

// ============================================
// REPORT CARDS
// ============================================

export async function getReportCardsByClass(params: {
  classId: string
  termId: string
  status?: ReportCardStatus
}) {
  const db = getDb()
  const conditions = [
    eq(reportCards.classId, params.classId),
    eq(reportCards.termId, params.termId),
  ]
  if (params.status) {
    conditions.push(eq(reportCards.status, params.status))
  }

  return db.query.reportCards.findMany({
    where: and(...conditions),
    with: {
      student: {
        columns: { id: true, firstName: true, lastName: true, matricule: true, photoUrl: true },
      },
      template: {
        columns: { id: true, name: true },
      },
    },
    orderBy: [asc(students.lastName), asc(students.firstName)],
  })
}

export async function getReportCardById(id: string) {
  const db = getDb()
  return db.query.reportCards.findFirst({
    where: eq(reportCards.id, id),
    with: {
      student: true,
      class: {
        with: {
          grade: true,
          series: true,
          homeroomTeacher: {
            with: { user: { columns: { name: true } } },
          },
        },
      },
      term: {
        with: { termTemplate: true },
      },
      schoolYear: {
        with: { schoolYearTemplate: true },
      },
      template: true,
      teacherComments: {
        with: {
          subject: true,
          teacher: {
            with: { user: { columns: { name: true } } },
          },
        },
      },
    },
  })
}

export async function getReportCardByStudentTerm(studentId: string, termId: string) {
  const db = getDb()
  return db.query.reportCards.findFirst({
    where: and(
      eq(reportCards.studentId, studentId),
      eq(reportCards.termId, termId),
    ),
  })
}

export async function createReportCard(data: ReportCardInsert) {
  const db = getDb()
  const [card] = await db.insert(reportCards).values(data).returning()
  return card
}

export async function updateReportCard(
  id: string,
  data: Partial<Omit<ReportCardInsert, 'id' | 'studentId' | 'classId' | 'termId' | 'schoolYearId'>>,
) {
  const db = getDb()
  const [updated] = await db
    .update(reportCards)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(reportCards.id, id))
    .returning()
  return updated
}

export async function updateReportCardStatus(
  id: string,
  status: ReportCardStatus,
  additionalData?: {
    generatedAt?: Date
    generatedBy?: string
    pdfUrl?: string
    pdfSize?: number
    sentAt?: Date
    sentTo?: string
    deliveryMethod?: 'email' | 'in_app' | 'sms' | 'print'
    deliveredAt?: Date
    viewedAt?: Date
    bounceReason?: string
  },
) {
  const db = getDb()
  const [updated] = await db
    .update(reportCards)
    .set({ status, ...additionalData, updatedAt: new Date() })
    .where(eq(reportCards.id, id))
    .returning()
  return updated
}

export async function bulkUpdateReportCardStatus(
  ids: string[],
  status: ReportCardStatus,
  additionalData?: Record<string, unknown>,
) {
  const db = getDb()
  return db
    .update(reportCards)
    .set({ status, ...additionalData, updatedAt: new Date() })
    .where(inArray(reportCards.id, ids))
    .returning()
}

export async function bulkCreateReportCards(data: ReportCardInsert[]) {
  const db = getDb()
  if (data.length === 0)
    return []
  return db.insert(reportCards).values(data).returning()
}

export async function bulkUpdateReportCards(
  ids: string[],
  data: Partial<Omit<ReportCardInsert, 'id' | 'studentId' | 'classId' | 'termId' | 'schoolYearId'>>,
) {
  const db = getDb()
  if (ids.length === 0)
    return []
  return db
    .update(reportCards)
    .set({ ...data, updatedAt: new Date() })
    .where(inArray(reportCards.id, ids))
    .returning()
}

export async function deleteReportCard(id: string) {
  const db = getDb()
  await db.delete(reportCards).where(eq(reportCards.id, id))
}

// ============================================
// DELIVERY STATUS
// ============================================

export async function getDeliveryStatusSummary(classId: string, termId: string) {
  const db = getDb()
  return db
    .select({
      status: reportCards.status,
      count: sql<number>`count(*)`,
    })
    .from(reportCards)
    .where(and(eq(reportCards.classId, classId), eq(reportCards.termId, termId)))
    .groupBy(reportCards.status)
}

export async function getUndeliveredReportCards(classId: string, termId: string) {
  const db = getDb()
  return db.query.reportCards.findMany({
    where: and(
      eq(reportCards.classId, classId),
      eq(reportCards.termId, termId),
      inArray(reportCards.status, ['generated', 'sent']),
    ),
    with: {
      student: {
        columns: { id: true, firstName: true, lastName: true },
      },
    },
  })
}

// ============================================
// TEACHER COMMENTS
// ============================================

export async function getTeacherCommentsByReportCard(reportCardId: string) {
  const db = getDb()
  return db.query.teacherComments.findMany({
    where: eq(teacherComments.reportCardId, reportCardId),
    with: {
      subject: true,
      teacher: {
        with: { user: { columns: { name: true } } },
      },
    },
  })
}

export async function createTeacherComment(data: TeacherCommentInsert) {
  const db = getDb()
  const [comment] = await db.insert(teacherComments).values(data).returning()
  return comment
}

export async function updateTeacherComment(id: string, comment: string) {
  const db = getDb()
  const [updated] = await db
    .update(teacherComments)
    .set({ comment, updatedAt: new Date() })
    .where(eq(teacherComments.id, id))
    .returning()
  return updated
}

export async function upsertTeacherComment(data: TeacherCommentInsert) {
  const db = getDb()
  // Check if comment exists
  const existing = await db.query.teacherComments.findFirst({
    where: and(
      eq(teacherComments.reportCardId, data.reportCardId),
      eq(teacherComments.subjectId, data.subjectId),
    ),
  })

  if (existing) {
    return updateTeacherComment(existing.id, data.comment)
  }
  return createTeacherComment(data)
}

export async function deleteTeacherComment(id: string) {
  const db = getDb()
  await db.delete(teacherComments).where(eq(teacherComments.id, id))
}

// ============================================
// REPORT CARD DATA ASSEMBLY
// ============================================

export async function getReportCardData(studentId: string, termId: string, classId: string) {
  const db = getDb()

  // Get student averages for the term
  const averages = await db.query.studentAverages.findMany({
    where: and(
      eq(studentAverages.studentId, studentId),
      eq(studentAverages.termId, termId),
      eq(studentAverages.classId, classId),
    ),
    with: {
      subject: true,
    },
  })

  // Get overall average (subjectId is null)
  const overallAverage = averages.find((a: typeof averages[number]) => a.subjectId === null)
  const subjectAverages = averages.filter((a: typeof averages[number]) => a.subjectId !== null)

  return {
    subjectAverages,
    overallAverage,
  }
}

export async function getClassReportCardStats(classId: string, termId: string) {
  const db = getDb()
  return db
    .select({
      total: sql<number>`count(*)`,
      draft: sql<number>`count(*) filter (where ${reportCards.status} = 'draft')`,
      generated: sql<number>`count(*) filter (where ${reportCards.status} = 'generated')`,
      sent: sql<number>`count(*) filter (where ${reportCards.status} = 'sent')`,
      delivered: sql<number>`count(*) filter (where ${reportCards.status} = 'delivered')`,
      viewed: sql<number>`count(*) filter (where ${reportCards.status} = 'viewed')`,
    })
    .from(reportCards)
    .where(and(eq(reportCards.classId, classId), eq(reportCards.termId, termId)))
}
