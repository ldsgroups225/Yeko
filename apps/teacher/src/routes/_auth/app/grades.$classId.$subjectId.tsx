import { IconArrowLeft, IconCheck, IconDeviceFloppy, IconUsers } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'

import { Input } from '@workspace/ui/components/input'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { classStudentsQueryOptions } from '@/lib/queries/sessions'
import { submitGrades } from '@/teacher/functions/grades'

export const Route = createFileRoute('/_auth/app/grades/$classId/$subjectId')({
  component: GradeEntryPage,
})

function GradeEntryPage() {
  const { t } = useTranslation()
  const { classId, subjectId } = Route.useParams()
  const queryClient = useQueryClient()

  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const { data, isLoading: dataLoading } = useQuery({
    ...classStudentsQueryOptions({
      classId,
      schoolYearId: context?.schoolYearId ?? '',
      subjectId,
    }),
    enabled: !!context,
  })

  // Local state for grades
  const [grades, setGrades] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

  const submitMutation = useMutation({
    mutationFn: submitGrades,
    onSuccess: () => {
      toast.success(t('grades.saved'))
      setIsDirty(false)
      queryClient.invalidateQueries({ queryKey: ['teacher', 'grades'] })
    },
    onError: () => {
      toast.error(t('errors.serverError'))
    },
  })

  const handleGradeChange = (studentId: string, value: string) => {
    // Allow empty, or numbers 0-20 with optional decimal
    if (value === '' || /^\d{0,2}(?:\.\d{0,2})?$/.test(value)) {
      const numValue = Number.parseFloat(value)
      if (value === '' || (numValue >= 0 && numValue <= 20)) {
        setGrades(prev => ({ ...prev, [studentId]: value }))
        setIsDirty(true)
      }
    }
  }

  const handleSave = (status: 'draft' | 'submitted') => {
    if (!context || !context.schoolYearId)
      return

    const gradeEntries = Object.entries(grades)
      .filter(([_, value]) => value !== '')
      .map(([studentId, value]) => ({
        studentId,
        grade: Number.parseFloat(value),
      }))

    if (gradeEntries.length === 0) {
      toast.error(t('grades.noGrades'))
      return
    }

    submitMutation.mutate({
      data: {
        teacherId: context.teacherId,
        schoolId: context.schoolId,
        schoolYearId: context.schoolYearId,
        classId,
        subjectId,
        grades: gradeEntries,
        status,
      },
    })
  }

  const isLoading = contextLoading || dataLoading

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="flex items-center gap-3">
        <Link to="/app/grades">
          <Button variant="ghost" size="icon">
            <IconArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold">{t('grades.enterGrades')}</h1>
          <p className="text-xs text-muted-foreground">
            {data?.className}
            {' '}
            •
            {data?.subjectName}
          </p>
        </div>
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
                        {t('common.students')}
                      </CardTitle>
                      <Badge variant="secondary">
                        {data.students.length}
                        {' '}
                        {t('common.students')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {data.students.map(student => (
                      <StudentGradeRow
                        key={student.id}
                        student={student}
                        value={grades[student.id] ?? ''}
                        onChange={value => handleGradeChange(student.id, value)}
                      />
                    ))}
                  </CardContent>
                </Card>

                {/* Fixed bottom action bar */}
                <div className="fixed inset-x-0 bottom-16 border-t bg-background p-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleSave('draft')}
                      disabled={!isDirty || submitMutation.isPending}
                    >
                      <IconDeviceFloppy className="mr-2 h-4 w-4" />
                      {t('grades.saveDraft')}
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleSave('submitted')}
                      disabled={!isDirty || submitMutation.isPending}
                    >
                      <IconCheck className="mr-2 h-4 w-4" />
                      {t('grades.submit')}
                    </Button>
                  </div>
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
    matricule: string
  }
  value: string
  onChange: (value: string) => void
}

function StudentGradeRow({ student, value, onChange }: StudentGradeRowProps) {
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
          placeholder="--"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-10 w-16 text-center text-lg font-semibold"
        />
        <span className="text-sm text-muted-foreground">/20</span>
      </div>
    </div>
  )
}

function EmptyStudents() {
  const { t } = useTranslation()

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <IconUsers className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          {t('grades.noStudents')}
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
