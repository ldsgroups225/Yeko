import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { classesOptions } from '@/lib/queries/classes'
import { bulkEnrollStudents } from '@/school/functions/bulk-operations'
import { getStudents } from '@/school/functions/students'

export function BulkEnrollmentCard() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { schoolYearId } = useSchoolYearContext()

  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [autoConfirm, setAutoConfirm] = useState(false)

  const { data: classes } = useQuery(classesOptions.list())

  const enrollMutation = useMutation({
    mutationFn: bulkEnrollStudents,
    onSuccess: (result) => {
      if (result.success && result.data) {
        toast.success(
          t.students.bulkOperations.enrollmentSuccess({
            count: result.data.succeeded,
          }),
        )
        queryClient.invalidateQueries({ queryKey: ['enrollments'] })
        queryClient.invalidateQueries({ queryKey: ['students'] })
      }
    },
    onError: () => {
      toast.error(t.students.bulkOperations.enrollmentError())
    },
  })

  const handleEnroll = async () => {
    if (!selectedClassId || !schoolYearId)
      return

    // Get students not yet enrolled
    const studentsResult = await getStudents({
      data: { limit: 1000 },
    })

    if (!studentsResult.data?.length) {
      toast.error(t.students.bulkOperations.noStudentsToEnroll())
      return
    }

    const studentIds = studentsResult.data.map(s => s.student.id)

    enrollMutation.mutate({
      data: {
        studentIds,
        classId: selectedClassId,
        schoolYearId,
        autoConfirm,
      },
    })
  }

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t.students.bulkOperations.bulkEnroll()}
        </CardTitle>
        <CardDescription>
          {t.students.bulkOperations.bulkEnrollDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t.students.class()}</Label>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger>
              <SelectValue placeholder={t.students.selectClass()} />
            </SelectTrigger>
            <SelectContent>
              {classes?.map(c => (
                <SelectItem key={c.class.id} value={c.class.id}>
                  {c.grade.name}
                  {' '}
                  {c.series?.name ?? ''}
                  {' '}
                  -
                  {' '}
                  {c.class.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card/30 p-4">
          <div className="space-y-0.5">
            <Label>{t.students.autoConfirmEnrollments()}</Label>
            <p className="text-sm text-muted-foreground">
              {t.students.autoConfirmEnrollmentsDescription()}
            </p>
          </div>
          <Switch checked={autoConfirm} onCheckedChange={setAutoConfirm} />
        </div>

        <Button
          onClick={handleEnroll}
          disabled={!selectedClassId || enrollMutation.isPending}
          className="w-full"
        >
          {enrollMutation.isPending
            ? t.common.loading()
            : t.students.bulkOperations.startEnrollment()}
        </Button>
      </CardContent>
    </Card>
  )
}
