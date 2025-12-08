import type { TimetableSessionInsert } from '../drizzle/school-schema'
import { and, asc, eq, gte, lte, ne, or, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { subjects } from '../drizzle/core-schema'
import {
  classes,
  classrooms,
  teachers,
  timetableSessions,
  users,
} from '../drizzle/school-schema'

// ============================================
// TIMETABLE SESSIONS
// ============================================

export async function getTimetableByClass(params: {
  classId: string
  schoolYearId: string
}) {
  const db = getDb()
  return db.query.timetableSessions.findMany({
    where: and(
      eq(timetableSessions.classId, params.classId),
      eq(timetableSessions.schoolYearId, params.schoolYearId),
    ),
    with: {
      subject: { columns: { id: true, name: true, shortName: true, category: true } },
      teacher: {
        with: { user: { columns: { id: true, name: true } } },
      },
      classroom: { columns: { id: true, name: true, code: true } },
    },
    orderBy: [asc(timetableSessions.dayOfWeek), asc(timetableSessions.startTime)],
  })
}

export async function getTimetableByTeacher(params: {
  teacherId: string
  schoolYearId: string
}) {
  const db = getDb()
  return db.query.timetableSessions.findMany({
    where: and(
      eq(timetableSessions.teacherId, params.teacherId),
      eq(timetableSessions.schoolYearId, params.schoolYearId),
    ),
    with: {
      class: {
        with: {
          grade: { columns: { name: true, code: true } },
          series: { columns: { name: true, code: true } },
        },
        columns: { id: true, section: true },
      },
      subject: { columns: { id: true, name: true, shortName: true } },
      classroom: { columns: { id: true, name: true, code: true } },
    },
    orderBy: [asc(timetableSessions.dayOfWeek), asc(timetableSessions.startTime)],
  })
}

export async function getTimetableByClassroom(params: {
  classroomId: string
  schoolYearId: string
}) {
  const db = getDb()
  return db.query.timetableSessions.findMany({
    where: and(
      eq(timetableSessions.classroomId, params.classroomId),
      eq(timetableSessions.schoolYearId, params.schoolYearId),
    ),
    with: {
      class: {
        with: {
          grade: { columns: { name: true } },
          series: { columns: { name: true } },
        },
        columns: { id: true, section: true },
      },
      subject: { columns: { id: true, name: true, shortName: true } },
      teacher: {
        with: { user: { columns: { name: true } } },
      },
    },
    orderBy: [asc(timetableSessions.dayOfWeek), asc(timetableSessions.startTime)],
  })
}

export async function getTimetableSessionById(id: string) {
  const db = getDb()
  return db.query.timetableSessions.findFirst({
    where: eq(timetableSessions.id, id),
    with: {
      class: {
        with: { grade: true, series: true },
      },
      subject: true,
      teacher: {
        with: { user: { columns: { name: true } } },
      },
      classroom: true,
    },
  })
}

export async function createTimetableSession(data: TimetableSessionInsert) {
  const db = getDb()
  const [session] = await db.insert(timetableSessions).values(data).returning()
  return session
}

export async function updateTimetableSession(
  id: string,
  data: Partial<Omit<TimetableSessionInsert, 'id' | 'schoolId' | 'schoolYearId'>>,
) {
  const db = getDb()
  const [updated] = await db
    .update(timetableSessions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(timetableSessions.id, id))
    .returning()
  return updated
}

export async function deleteTimetableSession(id: string) {
  const db = getDb()
  await db.delete(timetableSessions).where(eq(timetableSessions.id, id))
}

export async function bulkCreateTimetableSessions(sessions: TimetableSessionInsert[]) {
  const db = getDb()
  return db.insert(timetableSessions).values(sessions).returning()
}

export async function deleteClassTimetable(classId: string, schoolYearId: string) {
  const db = getDb()
  await db
    .delete(timetableSessions)
    .where(
      and(
        eq(timetableSessions.classId, classId),
        eq(timetableSessions.schoolYearId, schoolYearId),
      ),
    )
}

// ============================================
// CONFLICT DETECTION
// ============================================

export type ConflictType = 'teacher' | 'classroom' | 'class'

export interface TimetableConflict {
  type: ConflictType
  session1Id: string
  session2Id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  message: string
}

export async function detectConflicts(params: {
  schoolId: string
  schoolYearId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  teacherId?: string
  classroomId?: string
  classId?: string
  excludeSessionId?: string
}): Promise<TimetableConflict[]> {
  const db = getDb()
  const conflicts: TimetableConflict[] = []

  // Base conditions for time overlap
  const baseConditions = [
    eq(timetableSessions.schoolId, params.schoolId),
    eq(timetableSessions.schoolYearId, params.schoolYearId),
    eq(timetableSessions.dayOfWeek, params.dayOfWeek),
    // Time overlap: (start1 < end2) AND (start2 < end1)
    sql`${timetableSessions.startTime} < ${params.endTime}`,
    sql`${params.startTime} < ${timetableSessions.endTime}`,
  ]

  if (params.excludeSessionId) {
    baseConditions.push(ne(timetableSessions.id, params.excludeSessionId))
  }

  // Check teacher conflicts
  if (params.teacherId) {
    const teacherConflicts = await db
      .select({
        id: timetableSessions.id,
        dayOfWeek: timetableSessions.dayOfWeek,
        startTime: timetableSessions.startTime,
        endTime: timetableSessions.endTime,
      })
      .from(timetableSessions)
      .where(and(...baseConditions, eq(timetableSessions.teacherId, params.teacherId)))

    for (const session of teacherConflicts) {
      conflicts.push({
        type: 'teacher',
        session1Id: params.excludeSessionId ?? '',
        session2Id: session.id,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        message: 'Enseignant déjà assigné à cette heure',
      })
    }
  }

  // Check classroom conflicts
  if (params.classroomId) {
    const classroomConflicts = await db
      .select({
        id: timetableSessions.id,
        dayOfWeek: timetableSessions.dayOfWeek,
        startTime: timetableSessions.startTime,
        endTime: timetableSessions.endTime,
      })
      .from(timetableSessions)
      .where(and(...baseConditions, eq(timetableSessions.classroomId, params.classroomId)))

    for (const session of classroomConflicts) {
      conflicts.push({
        type: 'classroom',
        session1Id: params.excludeSessionId ?? '',
        session2Id: session.id,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        message: 'Salle déjà occupée à cette heure',
      })
    }
  }

  // Check class conflicts
  if (params.classId) {
    const classConflicts = await db
      .select({
        id: timetableSessions.id,
        dayOfWeek: timetableSessions.dayOfWeek,
        startTime: timetableSessions.startTime,
        endTime: timetableSessions.endTime,
      })
      .from(timetableSessions)
      .where(and(...baseConditions, eq(timetableSessions.classId, params.classId)))

    for (const session of classConflicts) {
      conflicts.push({
        type: 'class',
        session1Id: params.excludeSessionId ?? '',
        session2Id: session.id,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        message: 'Classe déjà en cours à cette heure',
      })
    }
  }

  return conflicts
}

export async function getAllConflictsForSchool(schoolId: string, schoolYearId: string) {
  const db = getDb()

  // Get all sessions grouped by day
  const sessions = await db.query.timetableSessions.findMany({
    where: and(
      eq(timetableSessions.schoolId, schoolId),
      eq(timetableSessions.schoolYearId, schoolYearId),
    ),
    with: {
      teacher: { with: { user: { columns: { name: true } } } },
      classroom: { columns: { name: true } },
      class: { columns: { section: true }, with: { grade: { columns: { name: true } } } },
    },
    orderBy: [asc(timetableSessions.dayOfWeek), asc(timetableSessions.startTime)],
  })

  const conflicts: TimetableConflict[] = []

  // Check each pair of sessions on the same day
  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      const s1 = sessions[i]
      const s2 = sessions[j]

      if (!s1 || !s2) continue
      if (s1.dayOfWeek !== s2.dayOfWeek) continue

      // Check time overlap
      if (!(s1.startTime < s2.endTime && s2.startTime < s1.endTime)) continue

      // Check for conflicts
      if (s1.teacherId === s2.teacherId) {
        conflicts.push({
          type: 'teacher',
          session1Id: s1.id,
          session2Id: s2.id,
          dayOfWeek: s1.dayOfWeek,
          startTime: s1.startTime,
          endTime: s1.endTime,
          message: `Conflit enseignant: ${s1.teacher?.user?.name}`,
        })
      }

      if (s1.classroomId && s1.classroomId === s2.classroomId) {
        conflicts.push({
          type: 'classroom',
          session1Id: s1.id,
          session2Id: s2.id,
          dayOfWeek: s1.dayOfWeek,
          startTime: s1.startTime,
          endTime: s1.endTime,
          message: `Conflit salle: ${s1.classroom?.name}`,
        })
      }

      if (s1.classId === s2.classId) {
        conflicts.push({
          type: 'class',
          session1Id: s1.id,
          session2Id: s2.id,
          dayOfWeek: s1.dayOfWeek,
          startTime: s1.startTime,
          endTime: s1.endTime,
          message: `Conflit classe: ${s1.class?.grade?.name} ${s1.class?.section}`,
        })
      }
    }
  }

  return conflicts
}

// ============================================
// TEACHER WORKLOAD
// ============================================

export async function getTeacherWeeklyHours(teacherId: string, schoolYearId: string) {
  const db = getDb()

  const sessions = await db.query.timetableSessions.findMany({
    where: and(
      eq(timetableSessions.teacherId, teacherId),
      eq(timetableSessions.schoolYearId, schoolYearId),
    ),
  })

  let totalMinutes = 0
  for (const session of sessions) {
    const [startH, startM] = session.startTime.split(':').map(Number)
    const [endH, endM] = session.endTime.split(':').map(Number)
    const startMinutes = (startH ?? 0) * 60 + (startM ?? 0)
    const endMinutes = (endH ?? 0) * 60 + (endM ?? 0)
    totalMinutes += endMinutes - startMinutes
  }

  return {
    totalHours: Math.floor(totalMinutes / 60),
    totalMinutes: totalMinutes % 60,
    sessionCount: sessions.length,
  }
}

// ============================================
// AVAILABILITY
// ============================================

export async function getTeacherAvailability(params: {
  teacherId: string
  schoolYearId: string
  dayOfWeek: number
}) {
  const db = getDb()

  const busySlots = await db
    .select({
      startTime: timetableSessions.startTime,
      endTime: timetableSessions.endTime,
    })
    .from(timetableSessions)
    .where(
      and(
        eq(timetableSessions.teacherId, params.teacherId),
        eq(timetableSessions.schoolYearId, params.schoolYearId),
        eq(timetableSessions.dayOfWeek, params.dayOfWeek),
      ),
    )
    .orderBy(asc(timetableSessions.startTime))

  return busySlots
}

export async function getClassroomAvailability(params: {
  classroomId: string
  schoolYearId: string
  dayOfWeek: number
}) {
  const db = getDb()

  const busySlots = await db
    .select({
      startTime: timetableSessions.startTime,
      endTime: timetableSessions.endTime,
      className: classes.section,
    })
    .from(timetableSessions)
    .innerJoin(classes, eq(timetableSessions.classId, classes.id))
    .where(
      and(
        eq(timetableSessions.classroomId, params.classroomId),
        eq(timetableSessions.schoolYearId, params.schoolYearId),
        eq(timetableSessions.dayOfWeek, params.dayOfWeek),
      ),
    )
    .orderBy(asc(timetableSessions.startTime))

  return busySlots
}
