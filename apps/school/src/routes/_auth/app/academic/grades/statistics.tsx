import type { Class } from '@repo/data-ops'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ClassAveragesTable, GradeStatisticsCard } from '@/components/grades'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
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

export const Route = createFileRoute('/_auth/app/academic/grades/statistics')({
  component: GradeStatisticsPage,
})

function GradeStatisticsPage() {
  const { t } = useTranslation()
  const { schoolYearId } = useSchoolYearContext()
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedTermId, setSelectedTermId] = useState<string>('')

  const { data: classesData, isLoading: classesLoading } = useQuery(
    classesOptions.list({ schoolYearId, status: 'active' }),
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
      <Breadcrumbs
        items={[
          { label: t('nav.academic'), href: '/app/academic' },
          { label: t('nav.grades'), href: '/app/academic/grades' },
          { label: t('academic.grades.statistics.title') },
        ]}
      />

      <div className="flex items-center gap-4">
        <Link to="/app/academic/grades">
          <Button variant="ghost" size="icon" aria-label={t('common.back')}>
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('academic.grades.statistics.title')}</h1>
          <p className="text-muted-foreground">
            {t('academic.grades.statistics.description')}
          </p>
        </div>
      </div>

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
                        {classesData?.map((cls: Class & { grade?: { name: string } }) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.grade?.name}
                            {' '}
                            {cls.section}
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
