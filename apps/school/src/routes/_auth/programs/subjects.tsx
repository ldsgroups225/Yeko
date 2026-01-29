import { IconCalendar, IconSparkles } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'

import { motion } from 'motion/react'
import { useState } from 'react'
import { SchoolSubjectList } from '@/components/academic/subjects/school-subject-list'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { getSchoolYears } from '@/school/functions/school-years'

export const Route = createFileRoute('/_auth/programs/subjects')({
  component: SchoolSubjectsPage,
})

function SchoolSubjectsPage() {
  const t = useTranslations()
  const [selectedYearId, setSelectedYearId] = useState<string>('')

  // Fetch school years
  const { data: schoolYearsResult, isLoading: yearsLoading } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
    staleTime: 5 * 60 * 1000,
  })
  const schoolYears = schoolYearsResult?.success ? schoolYearsResult.data : []

  // Auto-select active year
  if (!selectedYearId && schoolYears.length > 0) {
    const activeYear = schoolYears.find(y => y.isActive)
    if (activeYear) {
      setSelectedYearId(activeYear.id)
    }
  }

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.academic(), href: '/academic' },
          { label: t.nav.subjects() },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
            <IconSparkles className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.academic.subjects.title()}</h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-md">{t.academic.subjects.description()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full sm:w-[280px] space-y-1.5"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 block">
            {t.schoolYear.title()}
          </span>
          {yearsLoading
            ? (
                <Skeleton className="h-11 w-full rounded-xl" />
              )
            : (
                <Select
                  value={selectedYearId}
                  onValueChange={val => setSelectedYearId(val ?? '')}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all font-bold shadow-sm hover:bg-card/80">
                    <SelectValue placeholder={t.schoolYear.select()}>
                      {selectedYearId && (() => {
                        const selectedYear = schoolYears?.find(year => year.id === selectedYearId)
                        return selectedYear
                          ? (
                              <div className="flex items-center gap-2">
                                <IconCalendar className="size-3.5 text-primary/60" />
                                <span>
                                  {selectedYear.template.name}
                                  {' '}
                                  {selectedYear.isActive && t.schoolYear.activeSuffix()}
                                </span>
                              </div>
                            )
                          : null
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                    {schoolYears?.map(
                      year => (
                        <SelectItem key={year.id} value={year.id} className="rounded-lg focus:bg-primary/10 font-medium">
                          {year.template.name}
                          {' '}
                          {year.isActive && t.schoolYear.activeSuffix()}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              )}
        </motion.div>
      </div>

      {/* Subject List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {selectedYearId
          ? (
              <SchoolSubjectList schoolYearId={selectedYearId} />
            )
          : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-border/30 rounded-3xl bg-card/10">
                <p className="text-lg font-medium">{t.academic.subjects.messages.selectSchoolYearPrompt()}</p>
              </div>
            )}
      </motion.div>
    </div>
  )
}
