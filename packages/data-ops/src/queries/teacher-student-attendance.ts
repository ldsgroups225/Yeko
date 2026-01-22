/**
 * Student Attendance Queries for Teacher App
 * Queries for student attendance tracking
 */
import { and, asc, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

import { getDb } from "../database/setup";
import { grades } from "../drizzle/core-schema";
import {
  classes,
  classSessions,
  studentAttendance,
  students,
} from "../drizzle/school-schema";

/**
 * Save attendance records for a class session
 */
export async function saveSessionAttendance(params: {
  schoolId: string;
  classId: string;
  classSessionId?: string;
  date: string;
  teacherId: string;
  attendanceRecords: Array<{
    studentId: string;
    status: "present" | "absent" | "late" | "excused";
    reason?: string;
  }>;
}) {
  const db = getDb();

  return db.transaction(async (tx) => {
    for (const record of params.attendanceRecords) {
      await tx
        .insert(studentAttendance)
        .values({
          id: nanoid(),
          schoolId: params.schoolId,
          studentId: record.studentId,
          classId: params.classId,
          classSessionId: params.classSessionId ?? null,
          date: params.date,
          status: record.status,
          reason: record.reason ?? null,
          recordedBy: params.teacherId,
        })
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

    const presentCount = params.attendanceRecords.filter(
      (r) => r.status === "present",
    ).length;
    const absentCount = params.attendanceRecords.filter(
      (r) => r.status === "absent",
    ).length;

    if (params.classSessionId) {
      await tx
        .update(classSessions)
        .set({
          studentsPresent: presentCount,
          studentsAbsent: absentCount,
        })
        .where(eq(classSessions.id, params.classSessionId));
    }

    return { success: true, presentCount, absentCount };
  });
}

/**
 * Get attendance for a specific class session
 */
export async function getSessionAttendance(params: { classSessionId: string }) {
  const db = getDb();

  const result = await db
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
    .where(eq(studentAttendance.classSessionId, params.classSessionId))
    .orderBy(asc(students.lastName), asc(students.firstName));

  return result;
}

/**
 * Get attendance history for a class
 */
export async function getClassAttendanceHistory(params: {
  classId: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const db = getDb();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const conditions = [eq(studentAttendance.classId, params.classId)];
  if (params.startDate)
    conditions.push(gte(studentAttendance.date, params.startDate));
  if (params.endDate)
    conditions.push(lte(studentAttendance.date, params.endDate));

  const [records, countResult] = await Promise.all([
    db
      .select({
        id: studentAttendance.id,
        date: studentAttendance.date,
        studentName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
        studentMatricule: students.matricule,
        status: studentAttendance.status,
        reason: studentAttendance.reason,
      })
      .from(studentAttendance)
      .innerJoin(students, eq(studentAttendance.studentId, students.id))
      .where(and(...conditions))
      .orderBy(desc(studentAttendance.date))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(studentAttendance)
      .where(and(...conditions)),
  ]);

  return {
    records,
    total: countResult[0]?.count ?? 0,
    page,
    pageSize,
  };
}

/**
 * Get attendance rates for students in a class
 */
export async function getClassAttendanceRates(params: {
  classId: string;
  startDate?: string;
  endDate?: string;
}) {
  const db = getDb();

  const conditions = [eq(studentAttendance.classId, params.classId)];
  if (params.startDate)
    conditions.push(gte(studentAttendance.date, params.startDate));
  if (params.endDate)
    conditions.push(lte(studentAttendance.date, params.endDate));

  const results = await db
    .select({
      studentId: studentAttendance.studentId,
      studentName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
      studentMatricule: students.matricule,
      photoUrl: students.photoUrl,
      totalDays: count(studentAttendance.date),
      presentDays: count(
        sql`CASE WHEN ${studentAttendance.status} = 'present' THEN 1 END`,
      ),
      absentDays: count(
        sql`CASE WHEN ${studentAttendance.status} = 'absent' THEN 1 END`,
      ),
      lateDays: count(
        sql`CASE WHEN ${studentAttendance.status} = 'late' THEN 1 END`,
      ),
      excusedDays: count(
        sql`CASE WHEN ${studentAttendance.status} = 'excused' THEN 1 END`,
      ),
    })
    .from(studentAttendance)
    .innerJoin(students, eq(studentAttendance.studentId, students.id))
    .where(and(...conditions))
    .groupBy(
      studentAttendance.studentId,
      students.firstName,
      students.lastName,
      students.matricule,
      students.photoUrl,
    )
    .orderBy(asc(students.lastName), asc(students.firstName));

  return results.map((r: any) => ({
    ...r,
    attendanceRate:
      r.totalDays > 0
        ? Number.parseFloat(((r.presentDays / r.totalDays) * 100).toFixed(1))
        : 0,
  }));
}

/**
 * Get attendance statistics for a class
 */
export async function getClassAttendanceStats(params: {
  classId: string;
  startDate?: string;
  endDate?: string;
}) {
  const db = getDb();

  const conditions = [eq(studentAttendance.classId, params.classId)];
  if (params.startDate)
    conditions.push(gte(studentAttendance.date, params.startDate));
  if (params.endDate)
    conditions.push(lte(studentAttendance.date, params.endDate));

  const [totalStats, statusBreakdown] = await Promise.all([
    db
      .select({
        totalRecords: count(),
        uniqueDates: count(sql`DISTINCT ${studentAttendance.date}`),
      })
      .from(studentAttendance)
      .where(and(...conditions))
      .then((res) => res[0] ?? { totalRecords: 0, uniqueDates: 0 }),
    db
      .select({
        status: studentAttendance.status,
        count: count(),
      })
      .from(studentAttendance)
      .where(and(...conditions))
      .groupBy(studentAttendance.status),
  ]);

  const statusMap: Record<string, number> = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
  };

  for (const row of statusBreakdown) {
    statusMap[row.status!] = Number(row.count);
  }

  return {
    ...totalStats,
    ...statusMap,
  };
}

/**
 * Get student attendance history
 */
export async function getStudentAttendanceHistoryPaginated(params: {
  studentId: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const db = getDb();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const conditions = [eq(studentAttendance.studentId, params.studentId)];
  if (params.startDate)
    conditions.push(gte(studentAttendance.date, params.startDate));
  if (params.endDate)
    conditions.push(lte(studentAttendance.date, params.endDate));

  const [records, countResult] = await Promise.all([
    db
      .select({
        id: studentAttendance.id,
        date: studentAttendance.date,
        className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
        status: studentAttendance.status,
        reason: studentAttendance.reason,
      })
      .from(studentAttendance)
      .innerJoin(classes, eq(studentAttendance.classId, classes.id))
      .where(and(...conditions))
      .orderBy(desc(studentAttendance.date))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(studentAttendance)
      .where(and(...conditions)),
  ]);

  return {
    records,
    total: countResult[0]?.count ?? 0,
    page,
    pageSize,
  };
}
