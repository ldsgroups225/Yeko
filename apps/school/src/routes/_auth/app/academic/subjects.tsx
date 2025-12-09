import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SchoolSubjectList } from '@/components/academic/subjects/school-subject-list'
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
import { getSchoolYears } from '@/school/functions/school-years'

export const Route = createFileRoute('/_auth/app/academic/subjects')({
  component: SchoolSubjectsPage,
})

function SchoolSubjectsPage() {
  const { t } = useTranslation()
  const [selectedYearId, setSelectedYearId] = useState<string>('')

  // Fetch school years
  const { data: schoolYears, isLoading: yearsLoading } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
    staleTime: 5 * 60 * 1000,
  })

  // Auto-select active year
  if (!selectedYearId && schoolYears) {
    const activeYear = schoolYears.find((y: { isActive: boolean }) => y.isActive)
    if (activeYear) {
      setSelectedYearId(activeYear.id)
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.academic'), href: '/app/academic' },
          { label: t('nav.subjects') },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('academic.subjects.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('academic.subjects.description')}
          </p>
        </div>

        <div className="w-full sm:w-[250px]">
          {yearsLoading
            ? (
                <Skeleton className="h-10 w-full" />
              )
            : (
                <Select
                  value={selectedYearId}
                  onValueChange={setSelectedYearId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('schoolYear.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolYears?.map(
                      (year: any) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.template?.name || year.name}
                          {' '}
                          {year.isActive && t('schoolYear.activeSuffix')}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              )}
        </div>
      </div>

      {/* Subject List */}
      {selectedYearId
        ? (
            <SchoolSubjectList schoolYearId={selectedYearId} />
          )
        : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>{t('academic.subjects.messages.selectSchoolYearPrompt')}</p>
              </CardContent>
            </Card>
          )}
    </div>
  )
}
