import type { ClassSubjectWithDetails } from '@repo/data-ops/queries/class-subjects'

export interface ClassSubjectItem extends ClassSubjectWithDetails {}

export interface TeacherItem {
  id: string
  user: {
    name: string
  }
}
