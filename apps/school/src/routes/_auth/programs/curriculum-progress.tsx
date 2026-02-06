import { IconSparkles } from '@tabler/icons-react'
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
import {
  BehindScheduleAlert,
  ProgressCard,
  ProgressOverviewCards,
} from '@/components/curriculum-progress'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { progressOptions } from '@/lib/queries/curriculum-progress'
import { getClasses } from '@/school/functions/classes'
import { getSchoolYears } from '@/school/functions/school-years'
import { getTerms } from '@/school/functions/terms'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/programs/curriculum-progress')({
  component: CurriculumProgressPage,
})

function CurriculumProgressPage() {
  const t = useTranslations()
  const { schoolYearId: contextSchoolYearId } = useSchoolYearContext()
  const [localYearId, setLocalYearId] = useState<string>('')
  const [selectedTermId, setSelectedTermId] = useState<string>('')
  const [selectedClassId, setSelectedClassId] = useState<string>('')

  // Fetch school years
  const { data: schoolYearsResult, isLoading: yearsLoading } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
    staleTime: 5 * 60 * 1000,
  })
  const schoolYears = schoolYearsResult?.success ? schoolYearsResult.data : []

  // Determine effective year ID
  // If context has an ID, use it. Otherwise fall back to local selection or active year.
  const activeYear = schoolYears?.find(y => y.isActive)
  const effectiveYearId = contextSchoolYearId || localYearId || activeYear?.id || ''

  // Fetch terms for selected year
  const { data: termsResult, isLoading: termsLoading } = useQuery({
    queryKey: ['terms', effectiveYearId],
    queryFn: () => getTerms({ data: { schoolYearId: effectiveYearId } }),
    enabled: !!effectiveYearId,
    staleTime: 5 * 60 * 1000,
  })
  const terms = termsResult?.success ? termsResult.data : []

  // Fetch classes for selected year
  const { data: classesResult, isLoading: classesLoading } = useQuery({
    queryKey: ['classes', effectiveYearId],
    queryFn: () => getClasses({ data: { schoolYearId: effectiveYearId } }),
    enabled: !!effectiveYearId,
    staleTime: 5 * 60 * 1000,
  })
  const classes = classesResult?.success ? classesResult.data : []

  // Fetch progress for selected class and term
  const { data: progressResult, isLoading: progressLoading } = useQuery({
    ...progressOptions.byClass({ classId: selectedClassId, termId: selectedTermId }),
    enabled: !!selectedClassId && !!selectedTermId,
  })
  const progress = progressResult || []

  const canShowProgress = effectiveYearId && selectedTermId && selectedClassId

  // Mock overview data for now
  const overviewData = progress
    ? {
        totalClasses: classes?.length ?? 0,
        onTrack: progress.filter(p => p.status === 'on_track').length,
        slightlyBehind: progress.filter(p => p.status === 'slightly_behind').length,
        significantlyBehind: progress.filter(p => p.status === 'significantly_behind').length,
        ahead: progress.filter(p => p.status === 'ahead').length,
        averageProgress: progress.length > 0
          ? progress.reduce((sum, p) => sum + Number(p.progressPercentage), 0) / progress.length
          : 0,
      }
    : null

  const behindClasses = progress?.filter(
    p => p.status === 'slightly_behind' || p.status === 'significantly_behind',
  ).map(p => ({
    ...p,
    className: classes?.find(c => c.class.id === p.classId)?.grade.name ?? '',
    subjectName: p.programTemplate?.name ?? '',
    progressPercentage: Number(p.progressPercentage),
    expectedPercentage: p.expectedPercentage ? Number(p.expectedPercentage) : 0,
    variance: p.variance ? Number(p.variance) : 0,
  })) ?? []

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.academic(), href: '/academic' },
          { label: t.nav.curriculumProgress() },
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
            <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.curriculum.title()}</h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-lg">{t.curriculum.description()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-end"
        >
          {/* School Year */}
          <div className="w-full sm:w-[240px] space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 block">
              {t.schoolYear.title()}
            </span>
            {yearsLoading
              ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                )
              : (
                  <Select value={effectiveYearId} onValueChange={val => setLocalYearId(val ?? '')}>
                    <SelectTrigger className="h-11 rounded-xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all font-bold shadow-sm hover:bg-card/80">
                      <SelectValue placeholder={t.schoolYear.select()} />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                      {schoolYears?.map(year => (
                        <SelectItem key={year.id} value={year.id} className="rounded-lg focus:bg-primary/10 font-medium">
                          {year.template?.name}
                          {' '}
                          {year.isActive && t.schoolYear.activeSuffix()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
          </div>

          {/* Term */}
          <div className="w-full sm:w-[240px] space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 block">
              Trimestre
            </span>
            {termsLoading
              ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                )
              : (
                  <Select
                    value={selectedTermId}
                    onValueChange={val => setSelectedTermId(val ?? '')}
                    disabled={!effectiveYearId}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all font-bold shadow-sm hover:bg-card/80">
                      <SelectValue placeholder={t.terms.select()} />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                      {terms?.map(term => (
                        <SelectItem key={term.id} value={term.id} className="rounded-lg focus:bg-primary/10 font-medium">
                          {term.template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
          </div>

          {/* Class */}
          <div className="w-full sm:w-[240px] space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 block">
              {t.classes.title()}
            </span>
            {classesLoading
              ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                )
              : (
                  <Select
                    value={selectedClassId}
                    onValueChange={val => setSelectedClassId(val ?? '')}
                    disabled={!effectiveYearId}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all font-bold shadow-sm hover:bg-card/80">
                      <SelectValue placeholder={t.classes.select()} />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                      {classes?.map(item => (
                        <SelectItem key={item.class.id} value={item.class.id} className="rounded-lg focus:bg-primary/10 font-medium">
                          {item.grade.name}
                          {' '}
                          {item.class.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {canShowProgress
          ? (
              <div className="space-y-6">
                {/* Overview Cards */}
                <ProgressOverviewCards data={overviewData} isLoading={progressLoading} />

                {/* Behind Schedule Alert */}
                {behindClasses.length > 0 && (
                  <BehindScheduleAlert classes={behindClasses} />
                )}

                {/* Progress Cards Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {progressLoading
                    ? (
                        Array.from({ length: 6 }).map(() => (
                          <Skeleton key={generateUUID()} className="h-48 rounded-3xl" />
                        ))
                      )
                    : (
                        progress?.map(item => (
                          <ProgressCard
                            key={item.id}
                            subjectName={item.programTemplate?.name ?? ''}
                            completedChapters={item.completedChapters}
                            totalChapters={item.totalChapters}
                            expectedChapters={item.totalChapters ?? undefined}
                            progressPercentage={Number(item.progressPercentage)}
                            expectedPercentage={item.expectedPercentage ? Number(item.expectedPercentage) : undefined}
                            variance={item.variance ? Number(item.variance) : undefined}
                            status={item.status}
                          />
                        ))
                      )}
                </div>
              </div>
            )
          : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-border/30 rounded-3xl bg-card/10">
                <p className="text-lg font-medium">{t.curriculum.selectFiltersPrompt()}</p>
              </div>
            )}
      </motion.div>
    </div>
  )
}
