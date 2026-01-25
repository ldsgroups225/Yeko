import type { AttendanceSettingsInsert } from '../drizzle/school-schema'
import { eq } from 'drizzle-orm'

import { getDb } from '../database/setup'
import { attendanceSettings } from '../drizzle/school-schema'

// Get attendance settings for a school
export async function getAttendanceSettings(schoolId: string) {
  const db = getDb()
  const [settings] = await db
    .select()
    .from(attendanceSettings)
    .where(eq(attendanceSettings.schoolId, schoolId))
    .limit(1)

  // Return default settings if none exist
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
}

// Create or update attendance settings
export async function upsertAttendanceSettings(data: Omit<AttendanceSettingsInsert, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = getDb()
  const [result] = await db
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

  return result
}

// Update specific settings
export async function updateAttendanceSettings(
  schoolId: string,
  data: Partial<Omit<AttendanceSettingsInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>,
) {
  const db = getDb()
  const [result] = await db
    .update(attendanceSettings)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(attendanceSettings.schoolId, schoolId))
    .returning()

  return result
}

// Delete attendance settings (reset to defaults)
export async function deleteAttendanceSettings(schoolId: string) {
  const db = getDb()
  return db.delete(attendanceSettings).where(eq(attendanceSettings.schoolId, schoolId))
}
