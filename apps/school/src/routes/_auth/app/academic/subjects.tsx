import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { SchoolSubjectList } from '@/components/academic/subjects/school-subject-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { getSchoolYears } from '@/school/functions/school-years'

export const Route = createFileRoute('/_auth/app/academic/subjects')({
  component: SchoolSubjectsPage,
})

function SchoolSubjectsPage() {
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
    <div className="container py-6 space-y-6">
      {/* Year Selector */}
      <Card>
        <CardHeader>
          <CardTitle>School Year</CardTitle>
          <CardDescription>
            Select the school year to manage subjects for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label htmlFor="school-year">School Year</Label>
            {yearsLoading
              ? (
                <Skeleton className="h-10 w-full mt-2" />
              )
              : (
                <Select
                  value={selectedYearId}
                  onValueChange={setSelectedYearId}
                >
                  <SelectTrigger id="school-year" className="mt-2">
                    <SelectValue placeholder="Select school year" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolYears?.map((year: {
                      id: string
                      name: string
                      isActive: boolean
                    }) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                        {' '}
                        {year.isActive && '(Active)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Subject List */}
      {selectedYearId
        ? (
          <SchoolSubjectList schoolYearId={selectedYearId} />
        )
        : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>Please select a school year to manage subjects</p>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
