/**
 * Class Management Server Functions
 * Handles class CRUD operations and student enrollment
 */
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// Schema for getting teacher classes
export const getTeacherClassesSchema = z.object({
  teacherId: z.string(),
  schoolYearId: z.string(),
  schoolId: z.string().optional(),
  includeInactive: z.boolean().optional(),
})

// Schema for getting class details
export const getClassDetailsSchema = z.object({
  classId: z.string(),
  schoolYearId: z.string(),
})

// Schema for getting class students
export const getClassStudentsSchema = z.object({
  classId: z.string(),
  schoolYearId: z.string(),
  searchQuery: z.string().optional(),
})

// Schema for adding student to class
export const addStudentSchema = z.object({
  studentId: z.string(),
  classId: z.string(),
  schoolYearId: z.string(),
})

// Schema for removing student from class
export const removeStudentSchema = z.object({
  studentId: z.string(),
  classId: z.string(),
  schoolYearId: z.string(),
})

// Get all classes for a teacher
export const getTeacherClasses = createServerFn()
  .inputValidator(getTeacherClassesSchema)
  .handler(async ({ data }) => {
    const { getTeacherClasses: fetchClasses } = await import('@repo/data-ops/queries/teacher-classes')
    const classes = await fetchClasses({
      teacherId: data.teacherId,
      schoolYearId: data.schoolYearId,
      schoolId: data.schoolId,
      includeInactive: data.includeInactive,
    })

    return {
      success: true,
      classes,
    }
  })

// Get class details with students
export const getClassDetails = createServerFn()
  .inputValidator(getClassDetailsSchema)
  .handler(async ({ data }) => {
    const { getClassDetails: fetchDetails } = await import('@repo/data-ops/queries/teacher-classes')
    const classDetails = await fetchDetails({
      classId: data.classId,
      schoolYearId: data.schoolYearId,
    })

    if (!classDetails) {
      return {
        success: false,
        error: 'Class not found',
      }
    }

    return {
      success: true,
      class: classDetails,
    }
  })

// Get students for a class
export const getClassStudents = createServerFn()
  .inputValidator(getClassStudentsSchema)
  .handler(async ({ data }) => {
    const { getClassStudents: fetchStudents } = await import('@repo/data-ops/queries/teacher-classes')
    const students = await fetchStudents({
      classId: data.classId,
      schoolYearId: data.schoolYearId,
      searchQuery: data.searchQuery,
    })

    return {
      success: true,
      students,
    }
  })

// Add student to class
export const addStudentToClass = createServerFn()
  .inputValidator(addStudentSchema)
  .handler(async ({ data }) => {
    const { addStudentToClass: addStudent } = await import('@repo/data-ops/queries/teacher-classes')
    const enrollment = await addStudent({
      studentId: data.studentId,
      classId: data.classId,
      schoolYearId: data.schoolYearId,
    })

    return {
      success: true,
      enrollment,
    }
  })

// Remove student from class
export const removeStudentFromClass = createServerFn()
  .inputValidator(removeStudentSchema)
  .handler(async ({ data }) => {
    const { removeStudentFromClass: removeStudent } = await import('@repo/data-ops/queries/teacher-classes')
    await removeStudent({
      studentId: data.studentId,
      classId: data.classId,
      schoolYearId: data.schoolYearId,
    })

    return {
      success: true,
    }
  })

// Get class statistics
export const getClassStats = createServerFn()
  .inputValidator(getClassDetailsSchema)
  .handler(async ({ data }) => {
    const { getClassStats: fetchStats } = await import('@repo/data-ops/queries/teacher-classes')
    const stats = await fetchStats({
      classId: data.classId,
      schoolYearId: data.schoolYearId,
    })

    return {
      success: true,
      stats,
    }
  })
