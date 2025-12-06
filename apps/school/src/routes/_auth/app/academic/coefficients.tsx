import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CoefficientMatrix } from '@/components/academic/coefficients/coefficient-matrix'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
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
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Coefficient Management</h2>
        <p className="text-muted-foreground">
          Customize coefficients for subjects and grades. Override template values as needed.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Select school year and series to view coefficient matrix
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school-year">School Year Template</Label>
              {yearsLoading
                ? (
                  <Skeleton className="h-10 w-full" />
                )
                : (
                  <Select
                    value={selectedYearTemplateId}
                    onValueChange={setSelectedYearTemplateId}
                  >
                    <SelectTrigger id="school-year">
                      <SelectValue placeholder="Select school year" />
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
                          {year.name}
                          {' '}
                          {year.isActive && '(Active)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="series">Series (Optional)</Label>
              {seriesLoading
                ? (
                  <Skeleton className="h-10 w-full" />
                )
                : (
                  <Select
                    value={selectedSeriesId}
                    onValueChange={setSelectedSeriesId}
                  >
                    <SelectTrigger id="series">
                      <SelectValue placeholder="All series" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Series</SelectItem>
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
        </CardContent>
      </Card>

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
              <p>Please select a school year to view coefficients</p>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
