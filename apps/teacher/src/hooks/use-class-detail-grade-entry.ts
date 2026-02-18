import type { StudentCardProps } from '@/components/class-details/StudentCard'
import type { NoteWithDetails } from '@/lib/db/local-notes'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSync } from '@/hooks/useSync'
import { useI18nContext } from '@/i18n/i18n-react'
import { localNotesService } from '@/lib/db/local-notes'

type Student = StudentCardProps['student']

interface UseClassDetailGradeEntryParams {
  classId: string
  schoolId: string
  teacherId?: string
  students: Student[]
  teacherSubjects: Array<{ id: string }>
  unpublishedNote: NoteWithDetails | null | undefined
  refetchUnpublished: () => Promise<unknown>
}

export function useClassDetailGradeEntry({
  classId,
  schoolId,
  teacherId,
  students,
  teacherSubjects,
  unpublishedNote,
  refetchUnpublished,
}: UseClassDetailGradeEntryParams) {
  const { LL } = useI18nContext()
  const queryClient = useQueryClient()
  const { publishNotes } = useSync()

  const [isEntryMode, setIsEntryMode] = useState(false)
  const [isMetaExpanded, setIsMetaExpanded] = useState(true)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteType, setNoteType] = useState<'quizzes' | 'tests' | 'level_tests'>('tests')
  const [weight, setWeight] = useState(1)
  const [gradeOutOf, setGradeOutOf] = useState(20)
  const [gradesMap, setGradesMap] = useState<Map<string, string>>(() => new Map())
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUnpublishedSheetOpen, setIsUnpublishedSheetOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  const handleStartEntry = () => {
    if (!selectedSubjectId && teacherSubjects.length > 0)
      setSelectedSubjectId(teacherSubjects[0]!.id)

    setIsEntryMode(true)
    setIsMetaExpanded(true)
    setExpandedStudent(null)
  }

  const handleCancelEntry = () => {
    setIsEntryMode(false)
    setGradesMap(new Map())
  }

  const handleSaveEntry = async () => {
    if (!teacherId || !selectedSubjectId)
      return

    setIsSaving(true)
    try {
      const noteId = crypto.randomUUID()
      const noteDetails = Array.from(gradesMap.entries())
        .filter(([, val]) => val !== '')
        .map(([studentId, value]) => ({
          id: crypto.randomUUID(),
          noteId,
          studentId,
          value,
        }))

      await localNotesService.saveNoteLocally(
        {
          id: noteId,
          title: noteTitle,
          type: noteType,
          weight,
          totalPoints: gradeOutOf,
          schoolId,
          classId,
          subjectId: selectedSubjectId,
          teacherId,
        },
        noteDetails,
      )

      toast.success(LL.grades.savedLocally())
      await refetchUnpublished()
      setIsUnpublishedSheetOpen(true)
      setIsEntryMode(false)
      setGradesMap(new Map())
      setNoteTitle('')
    }
    catch {
      toast.error(LL.common.error())
    }
    finally {
      setIsSaving(false)
    }
  }

  const executePublish = async () => {
    if (!unpublishedNote)
      return
    setIsSaving(true)
    const result = await publishNotes({ noteIds: [unpublishedNote.id] })
    if (result.success) {
      toast.success(LL.grades.published())
      setIsConfirmDialogOpen(false)
      setIsUnpublishedSheetOpen(false)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['local-notes'] }),
        queryClient.invalidateQueries({ queryKey: ['class-stats'] }),
      ])
    }
    else {
      toast.error(LL.common.error())
    }
    setIsSaving(false)
  }

  const handlePublish = () => {
    if (!unpublishedNote)
      return
    if (unpublishedNote.details.length < students.length)
      setIsConfirmDialogOpen(true)
    else
      executePublish()
  }

  const handleGradeChange = (studentId: string, value: string) => {
    const newMap = new Map(gradesMap)
    if (value === '' || /^\d*(?:\.\d*)?$/.test(value)) {
      const numValue = Number.parseFloat(value)
      if (value === '' || (!Number.isNaN(numValue) && numValue <= gradeOutOf))
        newMap.set(studentId, value)
    }
    setGradesMap(newMap)
  }

  const toggleStudentExpansion = (studentId: string) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId)
  }

  const handleResumeUnpublished = () => {
    if (!unpublishedNote)
      return
    setNoteTitle(unpublishedNote.title)
    setNoteType(unpublishedNote.type as 'quizzes' | 'tests' | 'level_tests')
    setWeight(unpublishedNote.weight ?? 1)
    setGradeOutOf(unpublishedNote.totalPoints || 20)
    setSelectedSubjectId(unpublishedNote.subjectId)
    const map = new Map()
    unpublishedNote.details.forEach(d => map.set(d.studentId, d.value))
    setGradesMap(map)
    setIsEntryMode(true)
    setIsUnpublishedSheetOpen(false)
    setIsMetaExpanded(false)
  }

  return {
    isEntryMode,
    setIsEntryMode,
    isMetaExpanded,
    setIsMetaExpanded,
    selectedSubjectId,
    setSelectedSubjectId,
    noteTitle,
    setNoteTitle,
    noteType,
    setNoteType,
    weight,
    setWeight,
    gradeOutOf,
    setGradeOutOf,
    gradesMap,
    setGradesMap,
    expandedStudent,
    toggleStudentExpansion,
    handleGradeChange,
    handleStartEntry,
    handleCancelEntry,
    handleSaveEntry,
    handlePublish,
    executePublish,
    handleResumeUnpublished,
    isSaving,
    isUnpublishedSheetOpen,
    setIsUnpublishedSheetOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
  }
}
