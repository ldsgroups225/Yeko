import { IconArrowLeft, IconBook, IconCircleCheck, IconUsers } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { SessionTimer } from '@/components/session/session-timer'
import { StudentParticipationList } from '@/components/session/student-participation-list'
import {
  participationGradesQueryOptions,
  sessionDetailsQueryOptions,
  sessionStudentsQueryOptions,
} from '@/lib/queries/sessions'
import { recordParticipation } from '@/teacher/functions/participation'
import { completeSession } from '@/teacher/functions/sessions'

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
  // Load existing grades (for future use)
  useQuery(participationGradesQueryOptions({ classSessionId: sessionId }))

  const [localGrades, setLocalGrades] = useState<
    Map<string, { grade: number, comment: string | undefined }>
  >(() => new Map())

  const saveMutation = useMutation({
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

  const completeMutation = useMutation({
    mutationFn: async () => {
      return completeSession({
        data: {
          sessionId,
          studentsPresent: studentsData?.students.length ?? 0,
          studentsAbsent: 0,
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
      <Tabs defaultValue="participation" className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="participation" className="gap-1.5">
            <IconUsers className="h-4 w-4" />
            {t('session.participation')}
          </TabsTrigger>
          <TabsTrigger value="details" className="gap-1.5">
            <IconBook className="h-4 w-4" />
            {t('session.notes')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participation" className="mt-4">
          <StudentParticipationList
            students={studentsData?.students ?? []}
            grades={grades}
            onGradeChange={handleGradeChange}
            onCommentChange={handleCommentChange}
            onSave={() => saveMutation.mutate()}
            isSaving={saveMutation.isPending}
          />
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
      <div className="fixed bottom-20 left-0 right-0 border-t bg-background p-4">
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
