/**
 * Student Notes Page
 * View and create behavior/academic notes for students
 */
import { IconAlertTriangle, IconInfoCircle, IconPlus } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { Badge } from '@workspace/ui/components/badge'

import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useTranslation } from 'react-i18next'

import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { behaviorSummaryQueryOptions, studentNotesQueryOptions } from '@/lib/queries/student-notes'

export const Route = createFileRoute('/_auth/app/students/$studentId/notes')({
  component: StudentNotesPage,
})

function StudentNotesPage() {
  const { t } = useTranslation()
  const { studentId } = Route.useParams()
  const { context } = useRequiredTeacherContext()
  // const queryClient = useQueryClient()

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    ...behaviorSummaryQueryOptions({
      studentId,
      schoolYearId: context?.schoolYearId ?? '',
    }),
    enabled: !!studentId && !!context?.schoolYearId,
  })

  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    ...studentNotesQueryOptions({ studentId }),
    enabled: !!studentId,
  })

  /* const createMutation = useMutation({
    mutationFn: createStudentNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', 'student', studentId] })
      queryClient.invalidateQueries({ queryKey: ['notes', 'summary', studentId] })
    },
  }) */

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('notes.title', 'Notes de l\'élève')}</h1>
        <Button size="sm">
          <IconPlus className="w-4 h-4 mr-2" />
          {t('notes.add', 'Ajouter une note')}
        </Button>
      </div>

      {/* Behavior Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t('notes.summary', 'Résumé du comportement')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingSummary
            ? (
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(el => (
                    <Skeleton key={el} className="h-20 w-full" />
                  ))}
                </div>
              )
            : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-700">
                      {summary?.summary?.behaviorCount ?? 0}
                    </p>
                    <p className="text-sm text-red-600">{t('notes.behavior', 'Comportement')}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">
                      {summary?.summary?.academicCount ?? 0}
                    </p>
                    <p className="text-sm text-blue-600">{t('notes.academic', 'Académique')}</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-700">
                      {summary?.summary?.highPriorityCount ?? 0}
                    </p>
                    <p className="text-sm text-yellow-600">{t('notes.priority', 'Prioritaires')}</p>
                  </div>
                </div>
              )}
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('notes.history', 'Historique des notes')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingNotes
            ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map(el => (
                    <Skeleton key={el} className="h-16 w-full" />
                  ))}
                </div>
              )
            : notes?.notes?.length === 0
              ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t('notes.noNotes', 'Aucune note pour cet élève')}
                  </p>
                )
              : (
                  <div className="space-y-3">
                    {notes?.notes?.map((note: { id: string, title: string, content: string, type: string, priority: string, createdAt: Date }) => (
                      <div key={note.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {note.type === 'behavior' && (
                              <Badge variant="destructive">
                                <IconAlertTriangle className="w-3 h-3 mr-1" />
                                {t('notes.types.behavior', 'Comportement')}
                              </Badge>
                            )}
                            {note.type === 'academic' && (
                              <Badge variant="secondary">
                                <IconInfoCircle className="w-3 h-3 mr-1" />
                                {t('notes.types.academic', 'Académique')}
                              </Badge>
                            )}
                            {note.priority === 'high' || note.priority === 'urgent'
                              ? (
                                  <Badge variant="destructive">
                                    {t(`notes.priority.${note.priority}`, note.priority)}
                                  </Badge>
                                )
                              : null}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-medium">{note.title}</p>
                        <p className="text-sm text-muted-foreground">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
        </CardContent>
      </Card>
    </div>
  )
}
