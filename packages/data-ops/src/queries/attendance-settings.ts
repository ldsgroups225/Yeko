import type { AttendanceSettingsInsert } from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'

import { eq } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { attendanceSettings } from '../drizzle/school-schema'
import { DatabaseError } from '../errors'

// Get attendance settings for a school
export async function getAttendanceSettings(schoolId: string): R.ResultAsync<typeof attendanceSettings.$inferSelect | Omit<typeof attendanceSettings.$inferSelect, 'id' | 'createdAt' | 'updatedAt'> & { id: null }, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db
          .select()
          .from(attendanceSettings)
          .where(eq(attendanceSettings.schoolId, schoolId))
          .limit(1)

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
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch attendance settings'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId })),
  )
}

// Create or update attendance settings
export async function upsertAttendanceSettings(data: Omit<AttendanceSettingsInsert, 'id' | 'createdAt' | 'updatedAt'>): R.ResultAsync<typeof attendanceSettings.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db
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
        return rows[0]!
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to upsert attendance settings'),
    }),
    R.mapError(tapLogErr(databaseLogger, data)),
  )
}

// Update specific settings
export async function updateAttendanceSettings(
  schoolId: string,
  data: Partial<Omit<AttendanceSettingsInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>,
): R.ResultAsync<typeof attendanceSettings.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db
          .update(attendanceSettings)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(attendanceSettings.schoolId, schoolId))
          .returning()

        if (rows.length === 0) {
          throw new Error(`Attendance settings for school ${schoolId} not found`)
        }
        return rows[0]!
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update attendance settings'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, ...data })),
  )
}

// Delete attendance settings (reset to defaults)
export async function deleteAttendanceSettings(schoolId: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        await db.delete(attendanceSettings).where(eq(attendanceSettings.schoolId, schoolId))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete attendance settings'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId })),
  )
}
