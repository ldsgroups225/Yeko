import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ConductRecordForm } from '@/components/conduct/conduct-record-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createRecord } from '@/school/functions/conduct-records'

export const Route = createFileRoute('/_auth/app/school-life/conduct/new')({
  component: NewConductRecordPage,
})

function NewConductRecordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conduct-records'] })
      toast.success(t('conduct.created'))
      navigate({ to: '/app/school-life/conduct' })
    },
    onError: () => {
      toast.error(t('conduct.createFailed'))
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
    // TODO: Get schoolYearId from context
    const schoolYearId = 'current-year'

    mutation.mutate({
      data: {
        studentId: data.studentId,
        schoolYearId,
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
    navigate({ to: '/app/school-life/conduct' })
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Link to="/app/school-life/conduct">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{t('conduct.newRecord')}</h1>
        <p className="text-muted-foreground">{t('conduct.newRecordDescription')}</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t('conduct.form.title')}</CardTitle>
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
