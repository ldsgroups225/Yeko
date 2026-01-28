import type { AttendanceSettingsInsert } from '../drizzle/school-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'

import { eq } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { attendanceSettings } from '../drizzle/school-schema'
import { DatabaseError } from '../errors'

// Get attendance settings for a school
export function getAttendanceSettings(schoolId: string): ResultAsync<typeof attendanceSettings.$inferSelect | Omit<typeof attendanceSettings.$inferSelect, 'id' | 'createdAt' | 'updatedAt'> & { id: null }, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(attendanceSettings)
      .where(eq(attendanceSettings.schoolId, schoolId))
      .limit(1)
      .then((rows) => {
        const settings = rows[0]
        if (!settings) {
          return {
            id: null,
            schoolId,
            teacherExpectedArrival: '07:30',
            teacherLateThresholdMinutes: 15,
            teacherLatenessAlertCount: 3,
            studentLateThresholdMinutes: 10,
            chronicAbsenceThresholdPercent: '10.00',
            notifyParentOnAbsence: true,
            notifyParentOnLate: false,
            workingDays: [1, 2, 3, 4, 5],
            notificationMethods: ['email'],
          }
        }
        return settings
      }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch attendance settings'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId }))
}

// Create or update attendance settings
export function upsertAttendanceSettings(data: Omit<AttendanceSettingsInsert, 'id' | 'createdAt' | 'updatedAt'>): ResultAsync<typeof attendanceSettings.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .insert(attendanceSettings)
      .values({
        id: crypto.randomUUID(),
        ...data,
      })
      .onConflictDoUpdate({
        target: attendanceSettings.schoolId,
        set: {
          teacherExpectedArrival: data.teacherExpectedArrival,
          teacherLateThresholdMinutes: data.teacherLateThresholdMinutes,
          teacherLatenessAlertCount: data.teacherLatenessAlertCount,
          studentLateThresholdMinutes: data.studentLateThresholdMinutes,
          chronicAbsenceThresholdPercent: data.chronicAbsenceThresholdPercent,
          notifyParentOnAbsence: data.notifyParentOnAbsence,
          notifyParentOnLate: data.notifyParentOnLate,
          workingDays: data.workingDays,
          notificationMethods: data.notificationMethods,
          updatedAt: new Date(),
        },
      })
      .returning()
      .then(rows => rows[0]!),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to upsert attendance settings'),
  ).mapErr(tapLogErr(databaseLogger, data))
}

// Update specific settings
export function updateAttendanceSettings(
  schoolId: string,
  data: Partial<Omit<AttendanceSettingsInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>,
): ResultAsync<typeof attendanceSettings.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .update(attendanceSettings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(attendanceSettings.schoolId, schoolId))
      .returning()
      .then((rows) => {
        if (rows.length === 0) {
          throw new Error(`Attendance settings for school ${schoolId} not found`)
        }
        return rows[0]!
      }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update attendance settings'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, ...data }))
}

// Delete attendance settings (reset to defaults)
export function deleteAttendanceSettings(schoolId: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.delete(attendanceSettings).where(eq(attendanceSettings.schoolId, schoolId)).then(() => {}),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete attendance settings'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId }))
}
