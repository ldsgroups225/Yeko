export interface AssignmentItem {
  classId: string
  className: string
  subjectId: string | null
  subjectName: string | null
  teacherId: string | null
  teacherName: string | null
  hoursPerWeek: number | null
}

export interface TeacherItem {
  id: string
  user: {
    name: string
  }
}

export interface SubjectItem {
  id: string
  name: string
  shortName: string | null
}
