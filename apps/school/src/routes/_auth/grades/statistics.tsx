import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ClassAveragesTable, GradeStatisticsCard } from '@/components/grades'
import { SectionHeader } from '@/components/layout/page-layout'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { classesOptions } from '@/lib/queries/classes'
import { gradesOptions } from '@/lib/queries/grades'
import { termsOptions } from '@/lib/queries/terms'

export const Route = createFileRoute('/_auth/grades/statistics')({
  component: GradeStatisticsPage,
})

function GradeStatisticsPage() {
  const { t } = useTranslation()
  const { schoolYearId } = useSchoolYearContext()
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedTermId, setSelectedTermId] = useState<string>('')

  const { data: classesData, isLoading: classesLoading } = useQuery(
    classesOptions.list({ schoolYearId: schoolYearId ?? undefined, status: 'active' }),
  )

  const { data: termsData, isLoading: termsLoading } = useQuery(
    termsOptions.list(schoolYearId ?? ''),
  )

  const canFetchStats = selectedClassId && selectedTermId
  const { data: statisticsData, isLoading: statsLoading } = useQuery({
    ...gradesOptions.statistics({
      classId: selectedClassId,
      termId: selectedTermId,
    }),
    enabled: !!canFetchStats,
  })

  // Transform statistics for display
  const statistics = statisticsData?.[0] ?? {
    count: 0,
    average: 0,
    min: 0,
    max: 0,
    below10: 0,
    above15: 0,
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t('academic.grades.statistics.title')}
        description={t('academic.grades.statistics.description')}
        className="mb-4"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('academic.grades.filters.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="class-select">{t('academic.grades.entry.class')}</Label>
              {classesLoading
                ? (
                    <Skeleton className="h-10 w-full" />
                  )
                : (
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                      <SelectTrigger id="class-select">
                        <SelectValue placeholder={t('academic.grades.entry.selectClass')} />
                      </SelectTrigger>
                      <SelectContent>
                        {classesData?.map(item => (
                          <SelectItem key={item.class.id} value={item.class.id}>
                            {item.grade.name}
                            {' '}
                            {item.class.section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="term-select">{t('academic.grades.entry.term')}</Label>
              {termsLoading
                ? (
                    <Skeleton className="h-10 w-full" />
                  )
                : (
                    <Select value={selectedTermId} onValueChange={setSelectedTermId}>
                      <SelectTrigger id="term-select">
                        <SelectValue placeholder={t('academic.grades.entry.selectTerm')} />
                      </SelectTrigger>
                      <SelectContent>
                        {termsData?.map((term: any) => (
                          <SelectItem key={term.id} value={term.id}>
                            {term.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
            </div>
          </div>
        </CardContent>
      </Card>

      {canFetchStats && (
        <>
          {statsLoading
            ? (
                <Skeleton className="h-32 w-full" />
              )
            : (
                <GradeStatisticsCard statistics={statistics} />
              )}

          <ClassAveragesTable averages={[]} />
        </>
      )}
    </div>
  )
}
