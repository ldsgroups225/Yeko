/**
 * Student Attendance Queries for School App
 * Core attendance functions for student tracking
 */
import { and, asc, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

import { getDb } from "../database/setup";
import { grades } from "../drizzle/core-schema";
import { classes, studentAttendance, students } from "../drizzle/school-schema";

/**
 * Get class attendance for a specific date
 */
export async function getClassAttendance(params: {
  classId: string;
  date: string;
  classSessionId?: string;
}) {
  const db = getDb();
  const conditions = [
    eq(studentAttendance.classId, params.classId),
    eq(studentAttendance.date, params.date),
  ];
  if (params.classSessionId) {
    conditions.push(
      eq(studentAttendance.classSessionId, params.classSessionId),
    );
  }

  return db
    .select({
      id: studentAttendance.id,
      studentId: studentAttendance.studentId,
      studentName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
      studentMatricule: students.matricule,
      photoUrl: students.photoUrl,
      status: studentAttendance.status,
      reason: studentAttendance.reason,
      recordedAt: studentAttendance.createdAt,
    })
    .from(studentAttendance)
    .innerJoin(students, eq(studentAttendance.studentId, students.id))
    .where(and(...conditions))
    .orderBy(asc(students.lastName), asc(students.firstName));
}

/**
 * Upsert (create or update) student attendance record
 */
export async function upsertStudentAttendance(params: {
  id?: string;
  studentId: string;
  classId: string;
  schoolId: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  reason?: string;
  classSessionId?: string;
  recordedBy: string;
  lateThresholdMinutes?: number;
}) {
  const db = getDb();

  const record = {
    id: params.id ?? nanoid(),
    schoolId: params.schoolId,
    studentId: params.studentId,
    classId: params.classId,
    classSessionId: params.classSessionId ?? null,
    date: params.date,
    status: params.status,
    reason: params.reason ?? null,
    recordedBy: params.recordedBy,
  };

  const [result] = await db
    .insert(studentAttendance)
    .values(record)
    .onConflictDoUpdate({
      target: [
        studentAttendance.studentId,
        studentAttendance.date,
        studentAttendance.classId,
        studentAttendance.classSessionId,
      ],
      set: {
        status: sql`excluded.status`,
        reason: sql`excluded.reason`,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result;
}

/**
 * Bulk upsert class attendance records
 */
export async function bulkUpsertClassAttendance(params: {
  classId: string;
  schoolId: string;
  date: string;
  classSessionId?: string;
  recordedBy: string;
  entries: Array<{
    studentId: string;
    status: "present" | "absent" | "late" | "excused";
    reason?: string;
  }>;
}) {
  const db = getDb();

  const records = params.entries.map((entry) => ({
    id: nanoid(),
    schoolId: params.schoolId,
    studentId: entry.studentId,
    classId: params.classId,
    classSessionId: params.classSessionId ?? null,
    date: params.date,
    status: entry.status,
    reason: entry.reason ?? null,
    recordedBy: params.recordedBy,
  }));

  // Use transaction for bulk insert
  await db.transaction(async (tx) => {
    for (const record of records) {
      await tx
        .insert(studentAttendance)
        .values(record)
        .onConflictDoUpdate({
          target: [
            studentAttendance.studentId,
            studentAttendance.date,
            studentAttendance.classId,
            studentAttendance.classSessionId,
          ],
          set: {
            status: sql`excluded.status`,
            reason: sql`excluded.reason`,
            updatedAt: new Date(),
          },
        });
    }
  });

  return params.entries.length;
}

/**
 * Get student attendance history
 */
export async function getStudentAttendanceHistory(params: {
  studentId: string;
  startDate?: string;
  endDate?: string;
  classId?: string;
}) {
  const db = getDb();
  const conditions = [eq(studentAttendance.studentId, params.studentId)];

  if (params.startDate)
    conditions.push(gte(studentAttendance.date, params.startDate));
  if (params.endDate)
    conditions.push(lte(studentAttendance.date, params.endDate));
  if (params.classId)
    conditions.push(eq(studentAttendance.classId, params.classId));

  return db
    .select({
      id: studentAttendance.id,
      date: studentAttendance.date,
      className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
      classId: studentAttendance.classId,
      status: studentAttendance.status,
      reason: studentAttendance.reason,
    })
    .from(studentAttendance)
    .innerJoin(classes, eq(studentAttendance.classId, classes.id))
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .where(and(...conditions))
    .orderBy(desc(studentAttendance.date));
}

/**
 * Count student absences
 */
export async function countStudentAbsences(params: {
  studentId: string;
  startDate: string;
  endDate: string;
  excludeExcused?: boolean;
}): Promise<number> {
  const db = getDb();
  const conditions = [
    eq(studentAttendance.studentId, params.studentId),
    gte(studentAttendance.date, params.startDate),
    lte(studentAttendance.date, params.endDate),
    eq(studentAttendance.status, "absent"),
  ];

  if (params.excludeExcused) {
    conditions.push(eq(studentAttendance.status, "absent"));
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(studentAttendance)
    .where(and(...conditions));

  return Number(result?.count ?? 0);
}

/**
 * Excuse a student absence
 */
export async function excuseStudentAbsence(params: {
  attendanceId: string;
  excusedBy: string;
  reason?: string;
}) {
  const db = getDb();
  const [result] = await db
    .update(studentAttendance)
    .set({
      status: "excused",
      reason: params.reason ?? null,
      excusedBy: params.excusedBy,
      updatedAt: new Date(),
    })
    .where(eq(studentAttendance.id, params.attendanceId))
    .returning();

  return result;
}

/**
 * Delete student attendance record
 */
export async function deleteStudentAttendance(attendanceId: string) {
  const db = getDb();
  await db
    .delete(studentAttendance)
    .where(eq(studentAttendance.id, attendanceId));
}

/**
 * Get attendance statistics for a class or school
 */
export async function getAttendanceStatistics(params: {
  schoolId: string;
  startDate: string;
  endDate: string;
  classId?: string;
}) {
  const db = getDb();
  const conditions = [
    eq(studentAttendance.schoolId, params.schoolId),
    gte(studentAttendance.date, params.startDate),
    lte(studentAttendance.date, params.endDate),
  ];

  if (params.classId) {
    conditions.push(eq(studentAttendance.classId, params.classId));
  }

  const [stats] = await db
    .select({
      totalRecords: count(),
      present: sql<number>`count(*) filter (where ${studentAttendance.status} = 'present')`,
      absent: sql<number>`count(*) filter (where ${studentAttendance.status} = 'absent')`,
      late: sql<number>`count(*) filter (where ${studentAttendance.status} = 'late')`,
      excused: sql<number>`count(*) filter (where ${studentAttendance.status} = 'excused')`,
      uniqueStudents: sql<number>`count(distinct ${studentAttendance.studentId})`,
      uniqueDates: sql<number>`count(distinct ${studentAttendance.date})`,
    })
    .from(studentAttendance)
    .where(and(...conditions));

  const s = stats ?? {
    totalRecords: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    uniqueStudents: 0,
    uniqueDates: 0,
  };

  return {
    totalRecords: Number(s.totalRecords ?? 0),
    present: Number(s.present ?? 0),
    absent: Number(s.absent ?? 0),
    late: Number(s.late ?? 0),
    excused: Number(s.excused ?? 0),
    uniqueStudents: Number(s.uniqueStudents ?? 0),
    uniqueDates: Number(s.uniqueDates ?? 0),
    attendanceRate: s.totalRecords
      ? Number(((s.present! / s.totalRecords) * 100).toFixed(1))
      : 0,
  };
}

/**
 * Mark parent as notified for an attendance record
 */
export async function markParentNotified(params: {
  attendanceId: string;
  method: "email" | "sms" | "in_app";
}) {
  const db = getDb();
  const [result] = await db
    .update(studentAttendance)
    .set({
      parentNotified: true,
      notifiedAt: new Date(),
      notificationMethod: params.method,
      updatedAt: new Date(),
    })
    .where(eq(studentAttendance.id, params.attendanceId))
    .returning();

  return result;
}
