import { submitGrades } from '@/teacher/functions/grades'
import { teacherMutationKeys } from './keys'

// Grades migrations
export const gradesMutations = {
  submit: {
    mutationKey: teacherMutationKeys.grades.submit,
    mutationFn: (data: Parameters<typeof submitGrades>[0]['data']) => submitGrades({ data }),
  },
}
