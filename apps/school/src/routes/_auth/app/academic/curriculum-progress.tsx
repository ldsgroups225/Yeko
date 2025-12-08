import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  BehindScheduleAlert,
  ProgressCard,
  ProgressOverviewCards,
} from '@/components/curriculum-progress'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { progressOptions } from '@/lib/queries/curriculum-progress'
import { getClasses } from '@/school/functions/classes'
import { getSchoolYears } from '@/school/functions/school-years'
import { getTerms } from '@/school/functions/terms'

export const Route = createFileRoute('/_auth/app/academic/curriculum-progress')({
  component: CurriculumProgressPage,
})

function CurriculumProgressPage() {
  const { t } = useTranslation()
  const [selectedYearId, setSelectedYearId] = useState<string>('')
  const [selectedTermId, setSelectedTermId] = useState<string>('')
  const [selectedClassId, setSelectedClassId] = useState<string>('')

  // Fetch school years
  const { data: schoolYears, isLoading: yearsLoading } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
    staleTime: 5 * 60 * 1000,
  })

  // Fetch terms for selected year
  const { data: terms, isLoading: termsLoading } = useQuery({
    queryKey: ['terms', selectedYearId],
    queryFn: () => getTerms({ data: { schoolYearId: selectedYearId } }),
    enabled: !!selectedYearId,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch classes for selected year
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes', selectedYearId],
    queryFn: () => getClasses({ data: { schoolYearId: selectedYearId } }),
    enabled: !!selectedYearId,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch progress for selected class and term
  const { data: progress, isLoading: progressLoading } = useQuery({
    ...progressOptions.byClass({ classId: selectedClassId, termId: selectedTermId }),
    enabled: !!selectedClassId && !!selectedTermId,
  })

  // Auto-select active year
  if (!selectedYearId && schoolYears) {
    const activeYear = schoolYears.find((y: { isActive: boolean }) => y.isActive)
    if (activeYear) {
      setSelectedYearId(activeYear.id)
    }
  }

  const canShowProgress = selectedYearId && selectedTermId && selectedClassId

  // Mock overview data for now
  const overviewData = progress
    ? {
      totalClasses: classes?.length ?? 0,
      onTrack: progress.filter((p: { status: string }) => p.status === 'on_track').length,
      slightlyBehind: progress.filter((p: { status: string }) => p.status === 'slightly_behind').length,
      significantlyBehind: progress.filter((p: { status: string }) => p.status === 'significantly_behind').length,
      ahead: progress.filter((p: { status: string }) => p.status === 'ahead').length,
      averageProgress: progress.length > 0
        ? progress.reduce((sum: number, p: { progressPercentage: number }) => sum + p.progressPercentage, 0) / progress.length
        : 0,
    }
    : null

  const behindClasses = progress?.filter(
    (p: { status: string }) => p.status === 'slightly_behind' || p.status === 'significantly_behind',
  ) ?? []

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.academic'), href: '/app/academic' },
          { label: t('nav.curriculumProgress') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('curriculum.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('curriculum.description')}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* School Year */}
        <div className="w-full sm:w-[200px]">
          {yearsLoading
            ? (
              <Skeleton className="h-10 w-full" />
            )
            : (
              <Select value={selectedYearId} onValueChange={setSelectedYearId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('schoolYear.select')} />
                </SelectTrigger>
                <SelectContent>
                  {schoolYears?.map((year: { id: string, name: string, isActive: boolean }) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name}
                      {' '}
                      {year.isActive && t('schoolYear.activeSuffix')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
        </div>

        {/* Term */}
        <div className="w-full sm:w-[200px]">
          {termsLoading
            ? (
              <Skeleton className="h-10 w-full" />
            )
            : (
              <Select
                value={selectedTermId}
                onValueChange={setSelectedTermId}
                disabled={!selectedYearId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('terms.select')} />
                </SelectTrigger>
                <SelectContent>
                  {terms?.map((term: { id: string, name: string }) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
        </div>

        {/* Class */}
        <div className="w-full sm:w-[200px]">
          {classesLoading
            ? (
              <Skeleton className="h-10 w-full" />
            )
            : (
              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
                disabled={!selectedYearId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('classes.select')} />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((cls: { id: string, name: string }) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
        </div>
      </div>

      {/* Content */}
      {canShowProgress ? (
        <div className="space-y-6">
          {/* Overview Cards */}
          <ProgressOverviewCards data={overviewData} isLoading={progressLoading} />

          {/* Behind Schedule Alert */}
          {behindClasses.length > 0 && (
            <BehindScheduleAlert classes={behindClasses} />
          )}

          {/* Progress Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {progressLoading
              ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))
              )
              : (
                progress?.map((item: {
                  id: string
                  subjectName: string
                  teacherName?: string
                  completedChapters: number
                  totalChapters: number
                  expectedChapters?: number
                  progressPercentage: number
                  expectedPercentage?: number
                  variance?: number
                  status: 'on_track' | 'slightly_behind' | 'significantly_behind' | 'ahead'
                }) => (
                  <ProgressCard
                    key={item.id}
                    subjectName={item.subjectName}
                    teacherName={item.teacherName}
                    completedChapters={item.completedChapters}
                    totalChapters={item.totalChapters}
                    expectedChapters={item.expectedChapters}
                    progressPercentage={item.progressPercentage}
                    expectedPercentage={item.expectedPercentage}
                    variance={item.variance}
                    status={item.status}
                  />
                ))
              )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>{t('curriculum.selectFiltersPrompt')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
