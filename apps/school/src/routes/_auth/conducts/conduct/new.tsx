import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Plus, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
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
  const activeSchoolYear = schoolYears?.find(sy => sy.isActive)
  const effectiveSchoolYearId = contextSchoolYearId || activeSchoolYear?.id

  const mutation = useMutation({
    mutationFn: createRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conduct-records'] })
      toast.success(t.conduct.created(), {
        className: 'rounded-2xl backdrop-blur-xl bg-background/80 border-border/40 font-bold',
      })
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
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.schoolLife(), href: '/conducts' },
          { label: t.nav.conduct(), href: '/conducts/conduct' },
          { label: t.conduct.newRecord() },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
          <Plus className="size-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.conduct.newRecord()}</h1>
          <p className="text-sm font-medium text-muted-foreground italic max-w-md">{t.conduct.newRecordDescription()}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="max-w-4xl relative overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Sparkles className="size-32" />
          </div>
          <CardHeader className="relative border-b border-border/10 bg-muted/20">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t.conduct.form.title()}</CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <ConductRecordForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={mutation.isPending}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
