import { IconSparkles } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'

import { motion } from 'motion/react'
import { useState } from 'react'
import { CoefficientMatrix } from '@/components/academic/coefficients/coefficient-matrix'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { getSchoolYears } from '@/school/functions/school-years'
import { getSeries } from '@/school/functions/series'

export const Route = createFileRoute('/_auth/programs/coefficients')({
  component: CoefficientsPage,
})

function CoefficientsPage() {
  const t = useTranslations()
  const [selectedYearTemplateId, setSelectedYearTemplateId] = useState<string>('')
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('all')

  // Fetch school years to get templates
  const { data: schoolYears, isLoading: yearsLoading } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
    staleTime: 5 * 60 * 1000,
  })

  // Fetch series for filtering
  const { data: series, isLoading: seriesLoading } = useQuery({
    queryKey: ['series'],
    queryFn: () => getSeries({ data: {} }),
    staleTime: 10 * 60 * 1000,
  })

  // Auto-select active year
  if (!selectedYearTemplateId && schoolYears) {
    const activeYear = schoolYears.find((y: { isActive: boolean, schoolYearTemplateId: string | null }) => y.isActive)
    if (activeYear?.schoolYearTemplateId) {
      setSelectedYearTemplateId(activeYear.schoolYearTemplateId)
    }
  }

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.academic(), href: '/academic' },
          { label: t.nav.coefficients() },
        ]}
      />

      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
            <IconSparkles className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.coefficients.title()}</h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-md">{t.coefficients.description()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-end"
        >
          <div className="w-full sm:w-[280px] space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 block">
              {t.schoolYear.title()}
            </span>
            {yearsLoading
              ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                )
              : (
                  <Select
                    value={selectedYearTemplateId}
                    onValueChange={val => setSelectedYearTemplateId(val ?? '')}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all font-bold shadow-sm hover:bg-card/80">
                      <SelectValue placeholder={t.schoolYear.select()} />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                      {schoolYears?.map(year => (
                        <SelectItem
                          key={year.id}
                          value={year.schoolYearTemplateId || ''}
                          className="rounded-lg focus:bg-primary/10 font-medium"
                        >
                          {year.template.name}
                          {' '}
                          {year.isActive && t.schoolYear.activeSuffix()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
          </div>

          <div className="w-full sm:w-[240px] space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 block">
              {t.academic.coefficients.filters.series()}
            </span>
            {seriesLoading
              ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                )
              : (
                  <Select
                    value={selectedSeriesId}
                    onValueChange={val => setSelectedSeriesId(val ?? 'all')}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all font-bold shadow-sm hover:bg-card/80">
                      <SelectValue placeholder={t.coefficients.allSeries()} />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                      <SelectItem value="all" className="rounded-lg focus:bg-primary/10 italic text-muted-foreground">{t.coefficients.allSeries()}</SelectItem>
                      {series?.map((s: { id: string, name: string, code: string }) => (
                        <SelectItem key={s.id} value={s.id} className="rounded-lg focus:bg-primary/10 font-medium">
                          {s.name}
                          {' '}
                          (
                          {s.code}
                          )
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
          </div>
        </motion.div>
      </div>

      {/* Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {selectedYearTemplateId
          ? (
              <CoefficientMatrix
                schoolYearTemplateId={selectedYearTemplateId}
                seriesId={selectedSeriesId !== 'all' ? selectedSeriesId : null}
              />
            )
          : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-border/30 rounded-3xl bg-card/10">
                <p className="text-lg font-medium">{t.coefficients.selectYearPrompt()}</p>
              </div>
            )}
      </motion.div>
    </div>
  )
}
