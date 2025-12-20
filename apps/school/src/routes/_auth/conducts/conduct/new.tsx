import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ConductRecordForm } from '@/components/conduct/conduct-record-form'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { createRecord } from '@/school/functions/conduct-records'
import { getSchoolYears } from '@/school/functions/school-years'

export const Route = createFileRoute('/_auth/conducts/conduct/new')({
  component: NewConductRecordPage,
})

function NewConductRecordPage() {
  const t = useTranslations()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { schoolYearId: contextSchoolYearId } = useSchoolYearContext()

  const { data: schoolYears } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
  })

  // Find the active school year or use context school year
  const activeSchoolYear = schoolYears?.find((sy: any) => sy.isActive)
  const effectiveSchoolYearId = contextSchoolYearId || activeSchoolYear?.id

  const mutation = useMutation({
    mutationFn: createRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conduct-records'] })
      toast.success(t.conduct.created())
      navigate({ to: '/conducts/conduct' })
    },
    onError: () => {
      toast.error(t.conduct.createFailed())
    },
  })

  const handleSubmit = (data: {
    studentId: string
    type: 'incident' | 'sanction' | 'reward' | 'note'
    category: string
    title: string
    description: string
    severity?: 'low' | 'medium' | 'high' | 'critical'
    incidentDate?: Date
    incidentTime?: string
    location?: string
    witnesses?: string
  }) => {
    if (!effectiveSchoolYearId) {
      toast.error(t.classes.noSchoolYear())
      return
    }

    mutation.mutate({
      data: {
        studentId: data.studentId,
        schoolYearId: effectiveSchoolYearId,
        type: data.type,
        category: data.category as 'behavior' | 'academic' | 'attendance' | 'uniform' | 'property' | 'violence' | 'bullying' | 'cheating' | 'achievement' | 'improvement' | 'other',
        title: data.title,
        description: data.description,
        severity: data.severity,
        incidentDate: data.incidentDate?.toISOString().split('T')[0],
        incidentTime: data.incidentTime,
        location: data.location,
        witnesses: data.witnesses?.split(',').map(w => w.trim()).filter(Boolean),
      },
    })
  }

  const handleCancel = () => {
    navigate({ to: '/conducts/conduct' })
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.nav.schoolLife(), href: '/conducts' },
          { label: t.nav.conduct(), href: '/conducts/conduct' },
          { label: t.conduct.newRecord() },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.conduct.newRecord()}</h1>
        <p className="text-muted-foreground">{t.conduct.newRecordDescription()}</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t.conduct.form.title()}</CardTitle>
        </CardHeader>
        <CardContent>
          <ConductRecordForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={mutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
