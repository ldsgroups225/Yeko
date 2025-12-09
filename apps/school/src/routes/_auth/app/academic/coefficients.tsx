import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CoefficientMatrix } from '@/components/academic/coefficients/coefficient-matrix'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { getSchoolYears } from '@/school/functions/school-years'
import { getSeries } from '@/school/functions/series'

export const Route = createFileRoute('/_auth/app/academic/coefficients')({
  component: CoefficientsPage,
})

function CoefficientsPage() {
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
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Académique', href: '/app/academic' },
          { label: 'Coefficients' },
        ]}
      />

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des coefficients</h1>
          <p className="text-muted-foreground">
            Personnalisez les coefficients pour les matières et les classes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="w-full sm:w-[250px]">
            {yearsLoading
              ? (
                <Skeleton className="h-10 w-full" />
              )
              : (
                <Select
                  value={selectedYearTemplateId}
                  onValueChange={setSelectedYearTemplateId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Année scolaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolYears?.map((year: {
                      id: string
                      name: string
                      isActive: boolean
                      schoolYearTemplateId: string | null
                    }) => (
                      <SelectItem
                        key={year.id}
                        value={year.schoolYearTemplateId || ''}
                      >
                        {year.template?.name || year.name}
                        {' '}
                        {year.isActive && '(Active)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
          </div>

          <div className="w-full sm:w-[200px]">
            {seriesLoading
              ? (
                <Skeleton className="h-10 w-full" />
              )
              : (
                <Select
                  value={selectedSeriesId}
                  onValueChange={setSelectedSeriesId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les séries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les séries</SelectItem>
                    {series?.map((s: { id: string, name: string, code: string }) => (
                      <SelectItem key={s.id} value={s.id}>
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
      </div>

      {/* Matrix */}
      {selectedYearTemplateId
        ? (
          <CoefficientMatrix
            schoolYearTemplateId={selectedYearTemplateId}
            seriesId={selectedSeriesId !== 'all' ? selectedSeriesId : null}
          />
        )
        : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>Veuillez sélectionner une année scolaire pour voir les coefficients</p>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
