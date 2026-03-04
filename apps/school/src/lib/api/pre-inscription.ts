import { Result as R } from '@praha/byethrow'
import { getClassById, getClasses } from '@repo/data-ops/queries/classes'
import { createEnrollment, deleteEnrollment } from '@repo/data-ops/queries/enrollments/write'
import { getActiveSchoolYear } from '@repo/data-ops/queries/school-admin/school-years'
import { getSchoolByCode, getSchoolById } from '@repo/data-ops/queries/schools-read'
import { createStudentFeesBulk } from '@repo/data-ops/queries/student-fees'
import { getStudentById, getStudentByMatricule } from '@repo/data-ops/queries/students-read'
import { createStudent, deleteStudent } from '@repo/data-ops/queries/students-write'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  preInscriptionAcademicSelectionSchema,
  preInscriptionCreateStudentSchema,
  preInscriptionIdentificationSchema,
  preInscriptionPaymentSchema,
} from '../../schemas/pre-inscription'
import { computePreInscriptionFeePlan } from './pre-inscription-fee-plan'
import { resolvePreInscriptionOptionsByClass } from './pre-inscription-options'

const publicServerFn = createServerFn({
  method: 'POST',
})
interface GradeOption { id: string, name: string, classes: Array<{ id: string, name: string | null, seriesId: string | null, availableOptions: Array<'useTransport' | 'useCanteen' | 'isOrphan' | 'isStateAssigned'> }> }
const submitPreInscriptionSchema = z.object({
  schoolId: z.string(),
  schoolYearId: z.string(),
  studentId: z.string().optional(),
  student: preInscriptionCreateStudentSchema.optional(),
  academic: preInscriptionAcademicSelectionSchema,
  payment: preInscriptionPaymentSchema,
}).superRefine((data, ctx) => {
  if (!data.studentId && !data.student) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Identifiant étudiant ou informations étudiant requis',
      path: ['studentId'],
    })
  }
})
export const findSchoolAndStudentByCodeAndMatricule = publicServerFn
  .inputValidator(preInscriptionIdentificationSchema)
  .handler(async ({ data }) => {
    const { schoolCode, matricule } = data
    const schoolResult = await getSchoolByCode(schoolCode)
    if (R.isFailure(schoolResult)) {
      return { success: false as const, error: 'Établissement non trouvé' }
    }
    const school = schoolResult.value
    if (!school || school.status !== 'active') {
      return { success: false as const, error: 'Établissement non trouvé ou inactif' }
    }
    let student = null
    if (matricule) {
      const studentResult = await getStudentByMatricule(school.id, matricule)
      if (R.isFailure(studentResult)) {
        return {
          success: false as const,
          error: 'Impossible de vérifier le matricule pour le moment',
        }
      }
      student = studentResult.value
    }
    return {
      success: true as const,
      data: {
        school: {
          id: school.id,
          name: school.name,
          logoUrl: school.logoUrl,
        },
        student: student
          ? {
              id: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
              matricule: student.matricule,
              photoUrl: student.photoUrl,
              dob: student.dob,
              gender: student.gender ?? 'other',
            }
          : null,
      },
    }
  })
export const listPreInscriptionAcademicOptions = publicServerFn
  .inputValidator(z.object({ schoolId: z.string() }))
  .handler(async ({ data }) => {
    const schoolResult = await getSchoolById(data.schoolId)
    if (R.isFailure(schoolResult) || !schoolResult.value || schoolResult.value.status !== 'active') {
      return { success: false as const, error: 'Établissement non trouvé ou inactif' }
    }
    const yearResult = await getActiveSchoolYear(data.schoolId)
    if (R.isFailure(yearResult) || !yearResult.value) {
      return { success: false as const, error: 'Aucune année scolaire active trouvée' }
    }
    const classesResult = await getClasses({
      schoolId: data.schoolId,
      schoolYearId: yearResult.value.id,
      status: 'active',
    })
    if (R.isFailure(classesResult)) {
      return { success: false as const, error: 'Impossible de récupérer les classes' }
    }
    const optionsResult = await resolvePreInscriptionOptionsByClass({
      schoolId: data.schoolId,
      schoolYearId: yearResult.value.id,
      classes: classesResult.value.map(item => ({
        classId: item.class.id,
        gradeId: item.class.gradeId,
        seriesId: item.class.seriesId ?? null,
      })),
    })
    if (!optionsResult.success) {
      return { success: false as const, error: optionsResult.error }
    }
    const gradeMap = new Map<string, GradeOption>()
    for (const item of classesResult.value) {
      const grade = item.grade
      if (!gradeMap.has(grade.id)) {
        gradeMap.set(grade.id, { id: grade.id, name: grade.name, classes: [] })
      }
      gradeMap.get(grade.id)?.classes.push({
        id: item.class.id,
        name: item.class.section,
        seriesId: item.class.seriesId ?? null,
        availableOptions: optionsResult.data.get(item.class.id) ?? [],
      })
    }
    return {
      success: true as const,
      data: {
        schoolYearId: yearResult.value.id,
        grades: Array.from(gradeMap.values()),
      },
    }
  })
export const calculatePreInscriptionFees = publicServerFn
  .inputValidator(z.object({
    schoolId: z.string(),
    schoolYearId: z.string(),
    academic: preInscriptionAcademicSelectionSchema,
    isNewStudent: z.boolean().optional(),
  }))
  .handler(async ({ data }) => {
    const feePlanResult = await computePreInscriptionFeePlan({
      schoolId: data.schoolId,
      schoolYearId: data.schoolYearId,
      gradeId: data.academic.gradeId,
      seriesId: data.academic.seriesId ?? null,
      academic: data.academic,
      isNewStudent: Boolean(data.isNewStudent),
    })
    if (!feePlanResult.success) {
      return { success: false as const, error: feePlanResult.error }
    }
    if (feePlanResult.data.rawStructureCount === 0) {
      return { success: false as const, error: 'Aucune structure de frais disponible pour ce niveau' }
    }
    return {
      success: true as const,
      data: feePlanResult.data.summary,
    }
  })
export const submitPreInscription = publicServerFn
  .inputValidator(submitPreInscriptionSchema)
  .handler(async ({ data }) => {
    const { schoolId, schoolYearId, studentId, student, academic } = data
    const schoolResult = await getSchoolById(schoolId)
    if (R.isFailure(schoolResult) || !schoolResult.value || schoolResult.value.status !== 'active') {
      return { success: false as const, error: 'Établissement non trouvé ou inactif' }
    }
    const classResult = await getClassById(schoolId, academic.classId)
    if (R.isFailure(classResult)) {
      return { success: false as const, error: classResult.error.message }
    }
    const classData = classResult.value.class
    if (classData.schoolYearId !== schoolYearId) {
      return { success: false as const, error: 'Classe invalide pour l\'année scolaire sélectionnée' }
    }
    if (classData.gradeId !== academic.gradeId) {
      return { success: false as const, error: 'Incohérence entre niveau et classe sélectionnés' }
    }
    if ((academic.seriesId ?? null) !== (classData.seriesId ?? null)) {
      return { success: false as const, error: 'Incohérence entre série et classe sélectionnées' }
    }
    if (classData.status !== 'active') {
      return { success: false as const, error: 'La classe sélectionnée est inactive' }
    }
    const feePlanResult = await computePreInscriptionFeePlan({
      schoolId,
      schoolYearId,
      gradeId: classData.gradeId,
      seriesId: classData.seriesId ?? null,
      academic,
      isNewStudent: !studentId,
    })
    if (!feePlanResult.success) {
      return { success: false as const, error: feePlanResult.error }
    }
    if (feePlanResult.data.rawStructureCount === 0) {
      return { success: false as const, error: 'Aucune structure de frais disponible pour cette classe' }
    }
    let resolvedStudent: {
      id: string
      firstName: string
      lastName: string
      matricule: string
      photoUrl: string | null
      dob: string
      gender: 'M' | 'F' | 'other'
      schoolId: string
    } | null = null
    let createdStudentId: string | null = null
    if (studentId) {
      const studentResult = await getStudentById(studentId)
      if (R.isFailure(studentResult)) {
        return { success: false as const, error: studentResult.error.message }
      }
      if (studentResult.value.schoolId !== schoolId) {
        return { success: false as const, error: 'L\'étudiant ne correspond pas à cet établissement' }
      }
      resolvedStudent = {
        id: studentResult.value.id,
        firstName: studentResult.value.firstName,
        lastName: studentResult.value.lastName,
        matricule: studentResult.value.matricule,
        photoUrl: studentResult.value.photoUrl,
        dob: studentResult.value.dob,
        gender: studentResult.value.gender ?? 'other',
        schoolId: studentResult.value.schoolId,
      }
    }
    else if (student) {
      const createStudentResult = await createStudent({
        ...student,
        schoolId,
        schoolYearId,
      })
      if (R.isFailure(createStudentResult)) {
        return { success: false as const, error: createStudentResult.error.message }
      }
      createdStudentId = createStudentResult.value.id
      resolvedStudent = {
        id: createStudentResult.value.id,
        firstName: createStudentResult.value.firstName,
        lastName: createStudentResult.value.lastName,
        matricule: createStudentResult.value.matricule,
        photoUrl: createStudentResult.value.photoUrl,
        dob: createStudentResult.value.dob,
        gender: createStudentResult.value.gender ?? 'other',
        schoolId: createStudentResult.value.schoolId,
      }
    }
    if (!resolvedStudent) {
      return { success: false as const, error: 'Étudiant invalide' }
    }
    const enrollmentResult = await createEnrollment({
      studentId: resolvedStudent.id,
      classId: classData.id,
      schoolYearId,
    })
    if (R.isFailure(enrollmentResult)) {
      if (createdStudentId) {
        await deleteStudent(createdStudentId)
      }
      return { success: false as const, error: enrollmentResult.error.message }
    }
    const studentFeesData = feePlanResult.data.persistenceFees.map(fee => ({
      studentId: resolvedStudent.id,
      enrollmentId: enrollmentResult.value.id,
      feeStructureId: fee.feeStructureId,
      originalAmount: fee.originalAmount,
      discountAmount: fee.discountAmount,
      finalAmount: fee.finalAmount,
      balance: fee.finalAmount,
      status: 'pending' as const,
    }))
    const feeCreationResult = await createStudentFeesBulk(studentFeesData)
    if (R.isFailure(feeCreationResult)) {
      await deleteEnrollment(enrollmentResult.value.id)
      if (createdStudentId) {
        await deleteStudent(createdStudentId)
      }
      return { success: false as const, error: 'Échec de création des frais de scolarité' }
    }
    return {
      success: true as const,
      data: {
        enrollmentId: enrollmentResult.value.id,
        student: {
          id: resolvedStudent.id,
          firstName: resolvedStudent.firstName,
          lastName: resolvedStudent.lastName,
          matricule: resolvedStudent.matricule,
          photoUrl: resolvedStudent.photoUrl,
          dob: resolvedStudent.dob,
          gender: resolvedStudent.gender,
        },
      },
    }
  })
