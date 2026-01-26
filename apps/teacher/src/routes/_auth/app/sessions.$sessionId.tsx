import type { AttendanceStatus } from '@/components/session/student-attendance-list'
import { IconArrowLeft, IconBook, IconCircleCheck, IconClipboardList, IconPencil, IconUsers } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Checkbox } from '@workspace/ui/components/checkbox'

import { Label } from '@workspace/ui/components/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { SessionTimer } from '@/components/session/session-timer'
import { StudentAttendanceList } from '@/components/session/student-attendance-list'
import { StudentParticipationList } from '@/components/session/student-participation-list'
import {
  participationGradesQueryOptions,
  sessionDetailsQueryOptions,
  sessionStudentsQueryOptions,
} from '@/lib/queries/sessions'
import { recordParticipation } from '@/teacher/functions/participation'
import { completeSession, updateSessionAttendance } from '@/teacher/functions/sessions'

export const Route = createFileRoute('/_auth/app/sessions/$sessionId')({
  component: SessionDetailPage,
})

function SessionDetailPage() {
  const { sessionId } = Route.useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: sessionData } = useQuery(sessionDetailsQueryOptions({ sessionId }))

  // Get context from session data
  const classId = sessionData?.session?.classId ?? ''
  const schoolYearId = sessionData?.session?.schoolYearId ?? ''
  const teacherId = sessionData?.session?.teacherId ?? ''
  const { data: studentsData } = useQuery(
    sessionStudentsQueryOptions({ classId, schoolYearId }),
  )
  const { data: gradesData } = useQuery(participationGradesQueryOptions({ classSessionId: sessionId }))

  const [localGrades, setLocalGrades] = useState<
    Map<string, { grade: number, comment: string | undefined }>
  >(() => new Map())

  const [attendance, setAttendance] = useState<Map<string, AttendanceStatus>>(() => new Map())
  const [programCompleted, setProgramCompleted] = useState(false)

  // Sync attendance with students list (Pattern: Adjusting state during render)
  const [prevStudentsState, setPrevStudentsState] = useState(studentsData?.students)
  if (studentsData?.students !== prevStudentsState) {
    setPrevStudentsState(studentsData?.students)
    setAttendance((prev) => {
      const next = new Map(prev)
      let hasChanges = false

      studentsData?.students.forEach((s) => {
        if (!next.has(s.id)) {
          next.set(s.id, 'present')
          hasChanges = true
        }
      })

      return hasChanges ? next : prev
    })
  }

  // Sync grades from existing data (Pattern: Adjusting state during render)
  const [prevGradesState, setPrevGradesState] = useState(gradesData?.grades)
  if (gradesData?.grades !== prevGradesState) {
    setPrevGradesState(gradesData?.grades)
    setLocalGrades((prev) => {
      const next = new Map(prev)
      let hasChanges = false

      gradesData?.grades.forEach((g) => {
        if (!next.has(g.studentId)) {
          next.set(g.studentId, { grade: g.grade, comment: g.comment || undefined })
          hasChanges = true
        }
      })

      return hasChanges ? next : prev
    })
  }

  const saveParticipationMutation = useMutation({
    mutationFn: async () => {
      const grades = Array.from(localGrades.entries()).map(
        ([studentId, { grade, comment }]) => ({
          studentId,
          grade,
          comment,
        }),
      )
      return recordParticipation({
        data: {
          classSessionId: sessionId,
          teacherId,
          grades,
        },
      })
    },
    onSuccess: () => {
      toast.success(t('participation.saved'))
      queryClient.invalidateQueries({
        queryKey: ['teacher', 'participation', sessionId],
      })
    },
    onError: () => {
      toast.error(t('common.error'))
    },
  })

  const saveAttendanceMutation = useMutation({
    mutationFn: async () => {
      const studentsPresent = Array.from(attendance.values()).filter(s => s === 'present' || s === 'late').length
      const studentsAbsent = Array.from(attendance.values()).filter(s => s === 'absent' || s === 'excused').length

      return updateSessionAttendance({
        data: {
          sessionId,
          teacherId,
          studentsPresent,
          studentsAbsent,
        },
      })
    },
    onSuccess: () => {
      toast.success(t('common.saved', 'Enregistré'))
    },
    onError: () => {
      toast.error(t('common.error'))
    },
  })

  const completeMutation = useMutation({
    mutationFn: async () => {
      const studentsPresent = Array.from(attendance.values()).filter(s => s === 'present' || s === 'late').length
      const studentsAbsent = Array.from(attendance.values()).filter(s => s === 'absent' || s === 'excused').length

      const programNote = `Programme ministériel terminé: ${programCompleted ? 'Oui' : 'Non'}`

      return completeSession({
        data: {
          sessionId,
          studentsPresent,
          studentsAbsent,
          notes: programNote,
        },
      })
    },
    onSuccess: () => {
      toast.success(t('session.completed'))
      navigate({ to: '/app' })
    },
    onError: () => {
      toast.error(t('common.error'))
    },
  })

  const handleGradeChange = (studentId: string, grade: number) => {
    setLocalGrades((prev) => {
      const newMap = new Map(prev)
      const existing = newMap.get(studentId)
      newMap.set(studentId, { grade, comment: existing?.comment })
      return newMap
    })
  }

  const handleCommentChange = (studentId: string, comment: string) => {
    setLocalGrades((prev) => {
      const newMap = new Map(prev)
      const existing = newMap.get(studentId)
      newMap.set(studentId, { grade: existing?.grade ?? 0, comment: comment || undefined })
      return newMap
    })
  }

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => {
      const newMap = new Map(prev)
      newMap.set(studentId, status)
      return newMap
    })
  }

  const grades = Array.from(localGrades.entries()).map(
    ([studentId, { grade, comment }]) => ({
      studentId,
      grade,
      comment,
    }),
  )

  const session = sessionData?.session

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/app' })}
          aria-label={t('common.back')}
        >
          <IconArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold">{session?.className ?? t('session.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {session?.subjectName ?? ''}
          </p>
        </div>
        {session && (
          <SessionTimer startedAt={session.date} className="text-right" />
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="attendance" className="flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attendance" className="gap-1.5 p-1">
            <IconClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">{t('session.attendance', 'Appel')}</span>
          </TabsTrigger>
          <TabsTrigger value="participation" className="gap-1.5 p-1">
            <IconUsers className="h-4 w-4" />
            <span className="hidden sm:inline">{t('session.participation')}</span>
          </TabsTrigger>
          <TabsTrigger value="homework" className="gap-1.5 p-1">
            <IconBook className="h-4 w-4" />
            <span className="hidden sm:inline">{t('session.homework', 'Devoirs')}</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="gap-1.5 p-1">
            <IconPencil className="h-4 w-4" />
            <span className="hidden sm:inline">{t('session.notes')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-4">
          <StudentAttendanceList
            students={studentsData?.students ?? []}
            attendance={attendance}
            onStatusChange={handleAttendanceChange}
            onSave={() => saveAttendanceMutation.mutate()}
            isSaving={saveAttendanceMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="participation" className="mt-4">
          <StudentParticipationList
            students={studentsData?.students ?? []}
            grades={grades}
            onGradeChange={handleGradeChange}
            onCommentChange={handleCommentChange}
            onSave={() => saveParticipationMutation.mutate()}
            isSaving={saveParticipationMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="homework" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('session.homework', 'Devoirs')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fonctionnalité de devoirs à venir.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('session.notes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('session.addNotes')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Complete Session Button */}
      <div className="fixed bottom-20 left-0 right-0 border-t bg-background p-4 space-y-4">

        <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-lg">
          <Checkbox
            id="program-completed"
            checked={programCompleted}
            onCheckedChange={checked => setProgramCompleted(checked === true)}
          />
          <Label htmlFor="program-completed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Programme ministériel terminé
          </Label>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={() => completeMutation.mutate()}
          disabled={completeMutation.isPending}
        >
          <IconCircleCheck className="mr-2 h-5 w-5" />
          {completeMutation.isPending ? t('common.loading') : t('session.complete')}
        </Button>
      </div>
    </div>
  )
}
