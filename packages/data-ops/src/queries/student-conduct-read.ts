import { R } from "@praha/byethrow";
import { databaseLogger, tapLogErr } from "@repo/logger";
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "../database/setup";
import { conductRecords, studentAttendance } from "../drizzle/school-schema";
import { DatabaseError } from "../errors";

export interface StudentConductData {
  attendance: {
    totalAbsences: number;
    totalLateMinutes: number;
    latenessCount: number;
    excusedAbsences: number;
  };
  conduct: Array<{
    id: string;
    type: string;
    category: string;
    title: string;
    severity: string | null;
    incidentDate: string | null;
    sanctionType: string | null;
  }>;
}

export async function getStudentConductStats(
  studentId: string,
  schoolId: string,
): R.ResultAsync<StudentConductData, DatabaseError> {
  const db = getDb();
  return R.pipe(
    R.try({
      try: async () => {
        // Fetch Attendance Stats
        const attendanceStats = await db
          .select({
            totalAbsences: sql<number>`count(*) filter (where ${studentAttendance.status} = 'absent')::int`,
            latenessCount: sql<number>`count(*) filter (where ${studentAttendance.status} = 'late')::int`,
            totalLateMinutes: sql<number>`coalesce(sum(${studentAttendance.lateMinutes}) filter (where ${studentAttendance.status} = 'late'), 0)::int`,
            excusedAbsences: sql<number>`count(*) filter (where ${studentAttendance.status} = 'absent' and ${studentAttendance.excusedBy} is not null)::int`,
          })
          .from(studentAttendance)
          .where(
            and(
              eq(studentAttendance.studentId, studentId),
              eq(studentAttendance.schoolId, schoolId),
            ),
          );

        // Fetch Conduct Records
        const records = await db
          .select({
            id: conductRecords.id,
            type: conductRecords.type,
            category: conductRecords.category,
            title: conductRecords.title,
            severity: conductRecords.severity,
            incidentDate: conductRecords.incidentDate,
            sanctionType: conductRecords.sanctionType,
          })
          .from(conductRecords)
          .where(
            and(
              eq(conductRecords.studentId, studentId),
              eq(conductRecords.schoolId, schoolId),
            ),
          )
          .orderBy(desc(conductRecords.incidentDate));

        const attendance = attendanceStats[0] || {
          totalAbsences: 0,
          totalLateMinutes: 0,
          latenessCount: 0,
          excusedAbsences: 0,
        };

        return {
          attendance,
          conduct: records,
        };
      },
      catch: (err) =>
        DatabaseError.from(
          err,
          "INTERNAL_ERROR",
          "Failed to fetch student conduct stats",
        ),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId, schoolId })),
  );
}
