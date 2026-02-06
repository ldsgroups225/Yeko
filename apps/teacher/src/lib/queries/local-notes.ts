import { queryOptions } from '@tanstack/react-query'
import { localNotesService } from '@/lib/db/local-notes'

export const localNotesKeys = {
  all: ['local-notes'] as const,
  unpublished: (schoolId: string, classId: string, teacherId: string) =>
    [...localNotesKeys.all, 'unpublished', schoolId, classId, teacherId] as const,
  unpublishedCount: (schoolId: string, classId: string, teacherId: string) =>
    [...localNotesKeys.all, 'unpublished-count', schoolId, classId, teacherId] as const,
}

export function unpublishedNoteQueryOptions(params: {
  schoolId: string
  classId: string
  teacherId: string
}) {
  return queryOptions({
    queryKey: localNotesKeys.unpublished(params.schoolId, params.classId, params.teacherId),
    queryFn: () => localNotesService.findUnpublishedNote(params),
    staleTime: 0, // Always fresh as it's local PGlite
    enabled: !!params.teacherId && !!params.classId && !!params.schoolId,
  })
}

export function unpublishedCountQueryOptions(params: {
  schoolId: string
  classId: string
  teacherId: string
}) {
  return queryOptions({
    queryKey: localNotesKeys.unpublishedCount(params.schoolId, params.classId, params.teacherId),
    queryFn: () => localNotesService.countUnpublishedNotes(params),
    staleTime: 0,
    enabled: !!params.teacherId && !!params.classId && !!params.schoolId,
  })
}
