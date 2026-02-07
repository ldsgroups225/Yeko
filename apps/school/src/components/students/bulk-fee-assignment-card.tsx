import { IconWallet } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Label } from '@workspace/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { classesOptions } from '@/lib/queries/classes'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { bulkAssignFees } from '@/school/functions/bulk-operations'
import { generateUUID } from '@/utils/generateUUID'

interface ClassItem {
  id: string
  gradeId: string
  gradeName: string
  seriesName?: string | null
  section: string
}

export function BulkFeeAssignmentCard() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { schoolYearId } = useSchoolYearContext()

  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedGradeId, setSelectedGradeId] = useState<string>('')

  const { data: classes } = useQuery(classesOptions.list()) as { data: ClassItem[] | undefined }

  // Extract unique grades from classes
  const grades = classes
    ? [...new Map(classes.map((c: ClassItem) => [c.gradeId, { id: c.gradeId, name: c.gradeName }])).values()]
    : []

  const assignMutation = useMutation({
    mutationKey: schoolMutationKeys.students.bulkAssignFees,
    mutationFn: bulkAssignFees,
    onSuccess: (result: { success: boolean, data?: { succeeded: number } }) => {
      if (result.success && result.data) {
        toast.success(
          t.students.bulkOperations.feeAssignmentSuccess({
            count: result.data.succeeded,
          }),
        )
        queryClient.invalidateQueries({ queryKey: ['student-fees'] })
      }
    },
    onError: () => {
      toast.error(t.students.bulkOperations.feeAssignmentError())
    },
  })

  const handleAssignFees = () => {
    if (!schoolYearId)
      return

    assignMutation.mutate({
      data: {
        schoolYearId,
        classId: selectedClassId || undefined,
        gradeId: selectedGradeId || undefined,
      },
    })
  }

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconWallet className="h-5 w-5" />
          {t.students.bulkOperations.assignFees()}
        </CardTitle>
        <CardDescription>
          {t.students.bulkOperations.assignFeesDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t.students.bulkOperations.filterByGrade()}</Label>
          <Select value={selectedGradeId || 'all'} onValueChange={v => setSelectedGradeId(v === 'all' || v === null ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder={t.common.all()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all()}</SelectItem>
              {grades.map((g: { id: string, name: string }) => (
                <SelectItem key={generateUUID()} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t.students.bulkOperations.filterByClass()}</Label>
          <Select value={selectedClassId || 'all'} onValueChange={v => setSelectedClassId(v === 'all' || v === null ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder={t.common.all()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all()}</SelectItem>
              {classes
                ?.filter((c: ClassItem) => !selectedGradeId || c.gradeId === selectedGradeId)
                .map((c: ClassItem) => (
                  <SelectItem key={generateUUID()} value={c.id}>
                    {c.gradeName}
                    {' '}
                    {c.seriesName ?? ''}
                    {' '}
                    -
                    {' '}
                    {c.section}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleAssignFees}
          disabled={!schoolYearId || assignMutation.isPending}
          className="w-full"
        >
          {assignMutation.isPending
            ? t.common.loading()
            : t.students.bulkOperations.startFeeAssignment()}
        </Button>
      </CardContent>
    </Card>
  )
}
