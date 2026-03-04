import type { CreateStudentInput, ExportStudentRow, ImportStudentResult, StudentFilters } from './students-types'
import crypto from 'node:crypto'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { schoolYears, students } from '../drizzle/school-schema'
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'
import { getStudents } from './students-read'
import { generateMatricule } from './students-write'

export async function bulkImportStudents(
  schoolId: string,
  studentsData: Array<CreateStudentInput & { matricule?: string }>,
): R.ResultAsync<ImportStudentResult, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const results = { success: 0, errors: [] as Array<{ row: number, error: string }> }
        const [activeYear] = await db.select().from(schoolYears).where(and(eq(schoolYears.schoolId, schoolId), eq(schoolYears.isActive, true)))
        if (!activeYear)
          throw new Error(getNestedErrorMessage('students', 'noActiveSchoolYear'))

        const studentsToInsert = []
        for (let i = 0; i < studentsData.length; i++) {
          const studentData = studentsData[i]
          if (!studentData)
            continue
          let matricule = studentData.matricule
          if (!matricule) {
            const res = await generateMatricule(schoolId, activeYear.id)
            if (R.isFailure(res)) {
              results.errors.push({ row: i + 1, error: res.error.message })
              continue
            }
            matricule = res.value
          }
          studentsToInsert.push({ id: crypto.randomUUID(), ...studentData, matricule, admissionDate: studentData.admissionDate || new Date().toISOString().split('T')[0], createdAt: new Date(), updatedAt: new Date() })
        }

        if (studentsToInsert.length > 0) {
          const inserted = await db.insert(students).values(studentsToInsert).onConflictDoNothing({ target: [students.schoolId, students.matricule] }).returning()
          results.success = inserted?.length || 0
          const insertedMatricules = new Set(inserted?.map(s => s.matricule))
          studentsToInsert.forEach((s, idx) => {
            if (!insertedMatricules.has(s.matricule))
              results.errors.push({ row: idx + 1, error: getNestedErrorMessage('students', 'matriculeExistsWithId', { matricule: s.matricule }) })
          })
        }
        return results
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'bulkImportFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId })),
  )
}

export async function exportStudents(filters: StudentFilters): R.ResultAsync<ExportStudentRow[], DatabaseError> {
  const result = await getStudents({ ...filters, limit: 10000 })
  if (R.isFailure(result))
    return result
  return {
    type: 'Success',
    value: result.value.data.map(item => ({
      matricule: item.student.matricule,
      lastName: item.student.lastName,
      firstName: item.student.firstName,
      dateOfBirth: item.student.dob,
      gender: item.student.gender,
      status: item.student.status,
      class: item.currentClass ? `${item.currentClass.gradeName} ${item.currentClass.section}` : '',
      series: item.currentClass?.seriesName || '',
      nationality: item.student.nationality,
      address: item.student.address,
      emergencyContact: item.student.emergencyContact,
      emergencyPhone: item.student.emergencyPhone,
      admissionDate: item.student.admissionDate,
    })),
  }
}
