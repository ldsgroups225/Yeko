import { IconArrowLeft, IconCloudUpload, IconDeviceFloppy, IconUsers } from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { SyncStatusContainer } from '@/components/grades/SyncStatusContainer'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useNoteGrades } from '@/hooks/useLocalNotes'
import { useSync } from '@/hooks/useSync'
import { useI18nContext } from '@/i18n/i18n-react'
import { localNotesService } from '@/lib/db/local-notes'
import { classStudentsQueryOptions } from '@/lib/queries/sessions'
import { getCurrentTermFn } from '@/teacher/functions/schools'

export const Route = createFileRoute('/_auth/app/grades/$classId/$subjectId')({
  component: GradeEntryPage,
})

function GradeEntryPage() {
  const { LL } = useI18nContext()
  const { classId, subjectId } = Route.useParams()
  const queryClient = useQueryClient()

  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  // 1. Fetch class students
  const { data, isLoading: dataLoading } = useQuery({
    ...classStudentsQueryOptions({
      classId,
      schoolYearId: context?.schoolYearId ?? '',
      subjectId,
    }),
    enabled: !!context,
  })

  // 2. Fetch current term
  const { data: currentTerm } = useQuery({
    queryKey: ['schools', 'current-term', context?.schoolYearId],
    queryFn: () => getCurrentTermFn({ data: { schoolYearId: context?.schoolYearId ?? '' } }),
    enabled: !!context?.schoolYearId,
  })

  // 3. Manage local note state
  const [localNoteId, setLocalNoteId] = useState<string | null>(null)

  useEffect(() => {
    if (context && currentTerm && classId && subjectId && data?.className) {
      const initLocalNote = async () => {
        try {
          const note = await localNotesService.findNote({
            classId,
            subjectId,
            termId: currentTerm.id,
            type: 'CLASS_TEST',
            teacherId: context.teacherId,
          })

          if (!note) {
            const id = crypto.randomUUID()
            await localNotesService.saveNoteLocally({
              id,
              title: LL.grades.entryTitle({
                className: data.className,
                subjectName: data.subjectName,
              }),
              type: 'CLASS_TEST',
              classId,
              subjectId,
              termId: currentTerm.id,
              teacherId: context.teacherId,
              schoolId: context.schoolId,
              schoolYearId: context.schoolYearId,
              isPublished: false,
            })
            setLocalNoteId(id)
          }
          else {
            setLocalNoteId(note.id)
          }
        }
        catch (err) {
          console.error('Failed to initialize local note:', err)
        }
      }
      initLocalNote()
    }
  }, [context, currentTerm, classId, subjectId, data, LL])

  // 4. Hook into local grades
  const { grades: localGradesMap, updateGrade, isLoading: gradesLoading } = useNoteGrades({
    noteId: localNoteId ?? '',
  })

  // 5. Syncing hook
  const { publishNotes, isPublishing } = useSync()

  const handleSaveDraft = () => {
    toast.success(LL.grades.draftSaved())
  }

  const handlePublish = async () => {
    if (!localNoteId)
      return

    try {
      await localNotesService.publishNote(localNoteId)
      const result = await publishNotes({ noteIds: [localNoteId] })

      if (result.success) {
        toast.success(LL.grades.published())
        queryClient.invalidateQueries({ queryKey: ['teacher', 'grades'] })
      }
      else {
        toast.error(LL.grades.publishFailed())
      }
    }
    catch {
      toast.error(LL.errors.serverError())
    }
  }

  const handleGradeChange = (studentId: string, value: string) => {
    // Allow empty, or numbers 0-20 with optional decimal
    if (value === '' || /^\d{0,2}(?:\.\d{0,2})?$/.test(value)) {
      const numValue = Number.parseFloat(value)
      if (value === '' || (numValue >= 0 && numValue <= 20)) {
        updateGrade(studentId, value)
      }
    }
  }

  const isLoading = contextLoading || dataLoading || gradesLoading

  return (
    <div className="flex flex-col gap-4 p-4 pb-32">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/app/grades">
            <Button variant="ghost" size="icon">
              <IconArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">{LL.grades.enterGrades()}</h1>
            <p className="text-xs text-muted-foreground">
              {data?.className}
              {' '}
              •
              {data?.subjectName}
            </p>
          </div>
        </div>
        <SyncStatusContainer />
      </div>

      {isLoading
        ? <GradeEntrySkeleton />
        : data?.students && data.students.length > 0
          ? (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <IconUsers className="h-4 w-4" />
                        {LL.common.students()}
                      </CardTitle>
                      <Badge variant="secondary">
                        {data.students.length}
                        {' '}
                        {LL.common.students()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {data.students.map(student => (
                      <StudentGradeRow
                        key={student.id}
                        student={student}
                        value={localGradesMap.get(student.id) ?? ''}
                        onChange={value => handleGradeChange(student.id, value)}
                      />
                    ))}
                  </CardContent>
                </Card>

                {/* Fixed bottom action bar */}
                <div className="fixed inset-x-0 bottom-16 border-t bg-background p-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleSaveDraft}
                  >
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    {LL.grades.saveDraft()}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handlePublish}
                    disabled={isPublishing}
                  >
                    <IconCloudUpload className="mr-2 h-4 w-4" />
                    {LL.grades.publish()}
                  </Button>
                </div>
              </>
            )
          : <EmptyStudents />}
    </div>
  )
}

interface StudentGradeRowProps {
  student: {
    id: string
    firstName: string
    lastName: string
    matricule: string | null
  }
  value: string
  onChange: (value: string) => void
}

function StudentGradeRow({ student, value, onChange }: StudentGradeRowProps) {
  const { LL } = useI18nContext()
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {student.lastName}
          {' '}
          {student.firstName}
        </p>
        <p className="text-xs text-muted-foreground">{student.matricule}</p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          inputMode="decimal"
          placeholder={LL.common.notAvailable()}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-10 w-16 text-center text-lg font-semibold"
        />
        <span className="text-sm text-muted-foreground">
          {LL.grades.outOf()}
          {' '}
          20
        </span>
      </div>
    </div>
  )
}

function EmptyStudents() {
  const { LL } = useI18nContext()

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <IconUsers className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          {LL.grades.noStudents()}
        </p>
      </CardContent>
    </Card>
  )
}

function GradeEntrySkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
          >
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-10 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
