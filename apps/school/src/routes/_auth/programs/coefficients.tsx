import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@workspace/ui/components/page-header'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'

import { motion } from 'motion/react'
import { useState } from 'react'
import { CoefficientMatrix } from '@/components/academic/coefficients/coefficient-matrix'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { getSchoolYears } from '@/school/functions/school-years'
import { getSeries } from '@/school/functions/series'

export const Route = createFileRoute('/_auth/programs/coefficients')({
  component: CoefficientsPage,
})

function CoefficientsPage() {
  const t = useTranslations()
  const { schoolYearId } = useSchoolYearContext()
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('all')

  // Fetch school years to get templates
  const { data: schoolYearsResult, isPending: _yearsPending } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
    staleTime: 5 * 60 * 1000,
  })

  const schoolYears = schoolYearsResult?.success ? schoolYearsResult.data : []

  // Fetch series for filtering
  const { data: seriesResult, isPending: seriesPending } = useQuery({
    queryKey: ['series'],
    queryFn: () => getSeries({ data: {} }),
    staleTime: 10 * 60 * 1000,
  })

  const series = seriesResult?.success ? seriesResult.data : []

  // Derive template ID from global school year context
  const selectedYearTemplateId = schoolYears.find(y => y.id === schoolYearId)?.schoolYearTemplateId || ''

  return (
    <div className="space-y-8 p-1">

      <PageHeader
        title={t.coefficients.title()}
        description={t.coefficients.description()}
      >
        <div className="
          flex w-full flex-col items-end gap-4
          sm:flex-row
          xl:w-auto
        "
        >
          {/* Series selector */}
          <div className="
            w-full space-y-1.5
            sm:w-[240px]
          "
          >
            <span className="
              text-muted-foreground/60 ml-1 block text-[10px] font-black
              tracking-widest uppercase
            "
            >
              {t.academic.coefficients.filters.series()}
            </span>
            {seriesPending
              ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                )
              : (
                  <Select
                    value={selectedSeriesId}
                    onValueChange={val => setSelectedSeriesId(val ?? 'all')}
                  >
                    <SelectTrigger className="
                      bg-card/50 border-border/40
                      focus:ring-primary/20
                      hover:bg-card/80
                      h-11 rounded-xl font-bold shadow-sm backdrop-blur-xl
                      transition-all
                    "
                    >
                      <SelectValue placeholder={t.coefficients.allSeries()} />
                    </SelectTrigger>
                    <SelectContent className="
                      bg-popover/90 border-border/40 rounded-xl backdrop-blur-xl
                    "
                    >
                      <SelectItem
                        value="all"
                        className="
                          focus:bg-primary/10
                          text-muted-foreground rounded-lg italic
                        "
                      >
                        {t.coefficients.allSeries()}
                      </SelectItem>
                      {series?.map((s: { id: string, name: string, code: string }) => (
                        <SelectItem
                          key={s.id}
                          value={s.id}
                          className="
                            focus:bg-primary/10
                            rounded-lg font-medium
                          "
                        >
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
        </div>
      </PageHeader>

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
              <div className="
                text-muted-foreground border-border/30 bg-card/10 flex flex-col
                items-center justify-center rounded-3xl border-2 border-dashed
                py-20
              "
              >
                <p className="text-lg font-medium">{t.coefficients.selectYearPrompt()}</p>
              </div>
            )}
      </motion.div>
    </div>
  )
}
