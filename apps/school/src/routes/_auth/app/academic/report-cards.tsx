import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ReportCardList } from '@/components/report-cards'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { getClasses } from '@/school/functions/classes'
import { getSchoolYears } from '@/school/functions/school-years'
import { getTerms } from '@/school/functions/terms'

export const Route = createFileRoute('/_auth/app/academic/report-cards')({
  component: ReportCardsPage,
})

function ReportCardsPage() {
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

  // Auto-select active year
  if (!selectedYearId && schoolYears) {
    const activeYear = schoolYears.find((y: { isActive: boolean }) => y.isActive)
    if (activeYear) {
      setSelectedYearId(activeYear.id)
    }
  }

  const canShowReportCards = selectedYearId && selectedTermId && selectedClassId

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.academic'), href: '/app/academic' },
          { label: t('nav.reportCards') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('reportCards.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('reportCards.description')}
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

      {/* Report Cards List */}
      {canShowReportCards
        ? (
            <ReportCardList
              reportCards={[]}
              isLoading={false}
            />
          )
        : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>{t('reportCards.selectFiltersPrompt')}</p>
              </CardContent>
            </Card>
          )}
    </div>
  )
}
