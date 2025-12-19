import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SectionHeader } from '@/components/layout/page-layout'
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
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { getClasses } from '@/school/functions/classes'
import { getSchoolYears } from '@/school/functions/school-years'
import { getTerms } from '@/school/functions/terms'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/grades/report-cards')({
  component: ReportCardsPage,
})

function ReportCardsPage() {
  const { t } = useTranslation()
  const { schoolYearId: contextSchoolYearId } = useSchoolYearContext()
  const [selectedTermId, setSelectedTermId] = useState<string>('')
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [localYearId, setLocalYearId] = useState<string>('')

  // Fetch school years
  const { data: schoolYears, isLoading: yearsLoading } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
    staleTime: 5 * 60 * 1000,
  })

  // Determine effective year ID
  // If context has an ID, use it. Otherwise fall back to local selection or active year.
  const activeYear = schoolYears?.find((y: { isActive: boolean }) => y.isActive)
  const effectiveYearId = contextSchoolYearId || localYearId || activeYear?.id || ''

  // Fetch terms for selected year
  const { data: terms, isLoading: termsLoading } = useQuery({
    queryKey: ['terms', effectiveYearId],
    queryFn: () => getTerms({ data: { schoolYearId: effectiveYearId } }),
    enabled: !!effectiveYearId,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch classes for selected year
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes', effectiveYearId],
    queryFn: () => getClasses({ data: { schoolYearId: effectiveYearId } }),
    enabled: !!effectiveYearId,
    staleTime: 5 * 60 * 1000,
  })

  const canShowReportCards = effectiveYearId && selectedTermId && selectedClassId

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t('reportCards.title')}
        description={t('reportCards.description')}
        className="mb-4"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* School Year (Only show if not in context or if we want to allow override/viewing past)
            For now, let's keep it sync with context if available, or independent.
            Actually, commonly this page might want to see history regardless of context.
            Let's stick to the pattern: if context is present, it drives.
            But the UI showed a dropdown. Let's keep the dropdown but sync it with context if possible or just use local state if context is missing/not enforced.
            Wait, if context hook is present, usually the header allows changing it.
            If we want to allow overriding on this page specifically (viewing old report cards while working in current year), we can use local state.
            Let's use `localYearId` to drive the selection if context is not used or if we want to decouple.
            However, for consistency, let's allow the dropdown to switch years here.
         */}
        <div className="w-full sm:w-[200px]">
          {yearsLoading
            ? (
              <Skeleton className="h-10 w-full" />
            )
            : (
              <Select
                value={effectiveYearId}
                onValueChange={val => setLocalYearId(val)}
              // Disable if we want to enforce context, but here viewing history is valid
              >
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
                disabled={!effectiveYearId}
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
                disabled={!effectiveYearId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('classes.select')} />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((cls: { id: string, name: string }) => (
                    <SelectItem key={generateUUID()} value={cls.id}>
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
