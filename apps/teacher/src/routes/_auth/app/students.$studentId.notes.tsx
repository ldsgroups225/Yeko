import type { TranslationFunctions } from '@/i18n/i18n-types'
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
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'
import { behaviorSummaryQueryOptions, studentNotesQueryOptions } from '@/lib/queries/student-notes'

export const Route = createFileRoute('/_auth/app/students/$studentId/notes')({
  component: StudentNotesPage,
})

function StudentNotesPage() {
  const { LL } = useI18nContext()
  const { studentId } = Route.useParams()
  const { context } = useRequiredTeacherContext()
  // const queryClient = useQueryClient()

  const { data: summary, isPending: isPendingSummary } = useQuery({
    ...behaviorSummaryQueryOptions({
      studentId,
      schoolYearId: context?.schoolYearId ?? '',
    }),
    enabled: !!studentId && !!context?.schoolYearId,
  })

  const { data: notes, isPending: isPendingNotes } = useQuery({
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
        <h1 className="text-xl font-semibold">{LL.notes.title()}</h1>
        <Button size="sm">
          <IconPlus className="mr-2 h-4 w-4" />
          {LL.notes.add()}
        </Button>
      </div>

      {/* Behavior Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{LL.notes.summary()}</CardTitle>
        </CardHeader>
        <CardContent>
          {isPendingSummary
            ? (
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(el => (
                    <Skeleton key={el} className="h-20 w-full" />
                  ))}
                </div>
              )
            : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-destructive/10 rounded-lg p-4 text-center">
                    <p className="text-destructive text-2xl font-bold">
                      {summary?.summary?.behaviorCount ?? 0}
                    </p>
                    <p className="text-destructive/80 text-sm">{LL.notes.behavior()}</p>
                  </div>
                  <div className="bg-secondary/10 rounded-lg p-4 text-center">
                    <p className="text-secondary text-2xl font-bold">
                      {summary?.summary?.academicCount ?? 0}
                    </p>
                    <p className="text-secondary/80 text-sm">{LL.notes.academic()}</p>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-4 text-center">
                    <p className="text-accent-foreground text-2xl font-bold">
                      {summary?.summary?.highPriorityCount ?? 0}
                    </p>
                    <p className="text-accent-foreground/80 text-sm">{LL.notes.priority()}</p>
                  </div>
                </div>
              )}
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card>
        <CardHeader>
          <CardTitle>{LL.notes.history()}</CardTitle>
        </CardHeader>
        <CardContent>
          {isPendingNotes
            ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map(el => (
                    <Skeleton key={el} className="h-16 w-full" />
                  ))}
                </div>
              )
            : notes?.notes?.length === 0
              ? (
                  <p className="text-muted-foreground py-8 text-center">
                    {LL.notes.noNotes()}
                  </p>
                )
              : (
                  <div className="space-y-3">
                    {notes?.notes?.map((note: { id: string, title: string, content: string, type: string, priority: string, createdAt: Date }) => (
                      <div key={note.id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {note.type === 'behavior' && (
                              <Badge variant="destructive">
                                <IconAlertTriangle className="mr-1 h-3 w-3" />
                                {LL.notes.types.behavior()}
                              </Badge>
                            )}
                            {note.type === 'academic' && (
                              <Badge variant="secondary">
                                <IconInfoCircle className="mr-1 h-3 w-3" />
                                {LL.notes.types.academic()}
                              </Badge>
                            )}
                            {note.priority === 'high' || note.priority === 'urgent'
                              ? (
                                  <Badge variant="destructive">
                                    {LL.notes.priorityLevels[note.priority as keyof TranslationFunctions['notes']['priorityLevels']]()}
                                  </Badge>
                                )
                              : null}
                          </div>
                          <span className="text-muted-foreground text-sm">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-medium">{note.title}</p>
                        <p className="text-muted-foreground text-sm">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
        </CardContent>
      </Card>
    </div>
  )
}
